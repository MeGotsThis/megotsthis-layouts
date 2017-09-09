(function() {
  'use strict';

  const games = nodecg.Replicant('games');

  class MgtGameInfo extends Polymer.Element {
    static get is() {
      return 'mgt-game-info';
    }

    static get properties() {
      return {
        index: {
          type: Number,
          reflectToAttribute: true,
        },
        textType: {
          type: String,
          value: null,
        },
        subtextType: {
          type: String,
          value: null,
        },
        noColorOverride: {
          type: Boolean,
          value: false,
        },

        text: {
          computed: 'computeText(index, textType, _games)',
          observer: 'fitText',
        },
        subtext: {
          computed: 'computeText(index, subtextType, _games)',
          observer: 'fitSubText',
        },

        maxTextSize: {
          type: Number,
          value: 68,
        },
      };
    }

    ready() {
      super.ready();
      games.on('change', this.currentGameChanged.bind(this));
    }

    currentGameChanged(value) {
      this._games = [...value];
    }

    computeText(index, type, _games) {
      if (!_games) {
        return null;
      }
      type = validateType(type, null);
      if (!type) {
        return null;
      }
      let game = _games[index];
      let key = {};
      key[TYPE_GAME] = 'game';
      key[TYPE_RUNNER] = 'runner';
      key[TYPE_CATEGORY] = 'category';
      if (game && game[key[type]]) {
        return game[key[type]];
      }
      return null;
    }

    computeTextColor(index, noColorOverride, _games) {
      if (!_games || noColorOverride) {
        return '';
      }
      let game = _games[index];
      if (game && game.color) {
        return game.color;
      }
      return '';
    }

    fitText(text) {
      if (!text) {
        return;
      }
      Polymer.RenderStatus.afterNextRender(this, () => {
        // textFit overrides innerHTML so I need to override it.
        this.$.text.innerHTML = text;
        textFit(this.$.text, {maxFontSize: this.maxTextSize});
      });
    }

    fitSubText(subText) {
      if (!subText) {
        return;
      }
      Polymer.RenderStatus.afterNextRender(this, () => {
        const MAX_CATEGORY_WIDTH = this.$.subtext.clientWidth - 32;
        const subTextSpan = this.$.subtext.firstElementChild;
        const subTextWidth = subTextSpan.clientWidth;
        if (subTextWidth > MAX_CATEGORY_WIDTH) {
          let scaleX = MAX_CATEGORY_WIDTH / subTextWidth;
          TweenLite.set(subTextSpan, {scaleX: scaleX});
        } else {
          TweenLite.set(subTextSpan, {scaleX: 1});
        }
      });
    }
  }

  customElements.define(MgtGameInfo.is, MgtGameInfo);
})();
