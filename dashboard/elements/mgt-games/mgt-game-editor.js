(function() {
  'use strict';

  const games = nodecg.Replicant('games');

  class MgtGameEditor extends Polymer.Element {
    static get is() {
      return 'mgt-game-editor';
    }

    static get properties() {
      return {};
    }

    ready() {
      super.ready();
      games.on('change', (value) => {
        this.games = [{...value[0]}, {...value[1]}];
      });
      document.addEventListener('dialog-confirmed', () => {
        this.applyChanges.call(this);
      });
    }

    applyChanges() {
      for (let i = 0; i < 2; i++) {
        games.value[i] = this.games[i];
      }
    }
  }

  customElements.define(MgtGameEditor.is, MgtGameEditor);
})();
