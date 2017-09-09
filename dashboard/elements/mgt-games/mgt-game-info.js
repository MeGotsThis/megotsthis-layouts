(function() {
  'use strict';

  class MgtGameInfo extends Polymer.Element {
    static get is() {
      return 'mgt-game-info';
    }

    static get properties() {
      return {
        game: {
          observer: '_gameChanged',
        },
      };
    }

    _gameChanged() {
      if (this.game.color) {
        this.updateStyles({'--override-color': this.game.color});
      } else {
        this.updateStyles({'--override-color': null});
      }
    }
  }

  customElements.define(MgtGameInfo.is, MgtGameInfo);
})();
