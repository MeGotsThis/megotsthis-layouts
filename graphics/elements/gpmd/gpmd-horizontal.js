(function() {
  'use strict';

  class GooglePlayMusicDesktopHorizontal extends GooglePlayMusicDesktopBase {
    static get is() {
      return 'gpmd-horizontal';
    }
  }

  customElements.define(
     GooglePlayMusicDesktopHorizontal.is,
     GooglePlayMusicDesktopHorizontal);
})();
