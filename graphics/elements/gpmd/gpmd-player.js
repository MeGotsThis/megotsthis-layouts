(function() {
  'use strict';

  const gmpdConnected = nodecg.Replicant('gmpd-connected');
  const gmpd = nodecg.Replicant('gmpd');

  class GooglePlayMusicDesktopPlayer extends GooglePlayMusicDesktopBase {
    static get is() {
      return 'gpmd-player';
    }
  }

  customElements.define(
     GooglePlayMusicDesktopPlayer.is,
     GooglePlayMusicDesktopPlayer);
})();
