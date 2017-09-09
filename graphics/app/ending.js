(function() {
  'use strict';

  const MAX_NOW_PLAYING_WIDTH = 1146;
  const nowPlayingDisplay = document.getElementById('nowPlaying');
  const gmpd = nodecg.Replicant('gmpd');

  gmpd.on('change', (value) => {
    TweenLite.to(nowPlayingDisplay, 0.33, {
      opacity: 0,
      ease: Power1.easeInOut,
      onComplete() {
        if (!value || !value.playState || !value.track) {
          return;
        }

        let {title, album} = value.track;
        if (album) {
          nowPlayingDisplay.innerText = `${title} - ${album}`;
        } else {
          nowPlayingDisplay.innerText = `${title}`;
        }

        const width = nowPlayingDisplay.scrollWidth;
        if (width > MAX_NOW_PLAYING_WIDTH) {
          TweenLite.set(nowPlayingDisplay, {
            scaleX: MAX_NOW_PLAYING_WIDTH / width,
          });
        } else {
          TweenLite.set(nowPlayingDisplay, {
            scaleX: 1,
          });
        }

        TweenLite.to(nowPlayingDisplay, 0.33, {
          opacity: 1,
          ease: Power1.easeInOut,
        });
      },
    });
  });
})();
