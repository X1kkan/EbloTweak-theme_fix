const AppModules = {
    applyTheme: (data) => {
        let style = document.getElementById('ext-style-theme') || document.createElement('style');
        style.id = 'ext-style-theme';

        if (!data.enabled) {
            style.textContent = '';
        } else {
            style.textContent = `
                :root { --bg: ${data.bgColor || '#202020'} !important; }
                body { 
                    background-color: var(--bg) !important;
                    ${data.bgImage ? `background-image: url('${data.bgImage}') !important; background-size: cover !important; background-attachment: fixed !important;` : ''}
                }
            `;
        }
        if (!style.parentNode) document.head.appendChild(style);
    },

    initVideoPreviews: (isEnabled) => {
        document.removeEventListener('mouseover', window._extEnter, true);
        if (!isEnabled) return;

        window._extEnter = (e) => {
            const card = e.target.closest('.feed-card');
            if (!card || card._hasPreview) return;

            const img = card.querySelector('img[data-full-src*=".mp4"], img[data-full-src*=".mov"]');
            if (!img) return;

            card._hasPreview = true;

            const cleanup = () => {
                clearTimeout(card._previewTimeout);
                const video = card.querySelector('.ext-preview-video');
                if (video) {
                    video.pause();
                    video.src = "";
                    video.load();
                    video.remove();
                }
                card._hasPreview = false;
                card.removeEventListener('mouseleave', cleanup);
            };

            card.addEventListener('mouseleave', cleanup);

            card._previewTimeout = setTimeout(() => {
                if (!card._hasPreview) return;

                let videoUrl = img.getAttribute('data-full-src');
                if (videoUrl.startsWith('/')) videoUrl = window.location.origin + videoUrl;
                videoUrl += "#t=0,10";

                const container = img.closest('.feed-card-preview');
                if (!container) return;

                const video = document.createElement('video');
                video.muted = video.defaultMuted = video.loop = video.playsInline = true;
                video.preload = "metadata";
                video.className = 'ext-preview-video';
                video.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 999; pointer-events: none; border-radius: inherit; background: #000; opacity: 0; transition: opacity 0.2s;';

                video.onerror = () => cleanup();
                video.oncanplay = () => {
                    video.style.opacity = '1';
                    video.play().catch(() => { });
                };

                video.src = videoUrl;
                container.appendChild(video);
            }, 150);
        };

        document.addEventListener('mouseover', window._extEnter, true);
    }
};