const heroVideo = document.getElementById('heroVideo');
function ensureHeroPlayback() {
  if (!heroVideo) return;

  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.setAttribute('muted', '');
  heroVideo.playsInline = true;
  heroVideo.loop = true;
  heroVideo.src = '/public/assets/PointOnTheBowBannerDarkBlur2.mp4';

  const tryPlay = () => {
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  heroVideo.addEventListener('canplay', tryPlay);
  heroVideo.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && heroVideo.paused) tryPlay();
  });

  heroVideo.load();
  tryPlay();
}

ensureHeroPlayback();
