(function() {
  'use strict';

  const games = nodecg.Replicant('games');

  class MgtGames extends Polymer.Element {
    static get is() {
      return 'mgt-games';
    }

    static get properties() {
      return {};
    }

    ready() {
      super.ready();
      games.on('change', (value) => {
        this.games = [...value];
      });
    }

    editGame() {
      nodecg.getDialog('game-editor').open();
    }

    loadPreset() {
      nodecg.getDialog('load-game').open();
    }

    savePreset() {
      nodecg.getDialog('save-game').open();
    }
  }

  customElements.define(MgtGames.is, MgtGames);
})();
