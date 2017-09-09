(function() {
  'use strict';

  const games = nodecg.Replicant('games');
  const gameAudioChannels = nodecg.Replicant('gameAudioChannels');

  class MgtGameBar extends Polymer.Element {
    static get is() {
      return 'mgt-game-bar';
    }

    static get properties() {
      return {
        index: {
          type: Number,
          reflectToAttribute: true,
        },
        type: {
          type: String,
          value: null,
        },

        text: {
          computed: 'computeText(index, type, _games)',
          observer: 'fitText',
        },

        audio: {
          reflectToAttribute: true,
          observer: 'audioChanged',
        },
        attachLeft: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },
        attachRight: {
          type: Boolean,
          value: false,
          reflectToAttribute: true,
        },

        audioTL: {
          type: TimelineLite,
          value() {
            return new TimelineLite({autoRemoveChildren: true});
          },
          readOnly: true,
        },
      };
    }

    audioChanged(value) {
      if (value) {
        this.audioTL.to({}, 0.633, {
          onStart() {
            if (this.attachRight && !this._leftCapOpen) {
              this._leftCapOpen = true;
              this._leftCapSprite.gotoAndPlay('open');
            }
            if (this.attachLeft && !this._rightCapOpen) {
              this._rightCapOpen = true;
              this._rightCapSprite.gotoAndPlay('open');
            }
          },
          onStartScope: this,
        });
      } else {
        this.audioTL.to({}, 0.35, {
          onStart() {
            if (this.attachRight && this._leftCapOpen) {
              this._leftCapOpen = false;
              this._leftCapSprite.gotoAndPlay('close');
            }
            if (this.attachLeft && this._rightCapOpen) {
              this._rightCapOpen = false;
              this._rightCapSprite.gotoAndPlay('close');
            }
          },
          onStartScope: this,
        });
      }
    }

    ready() {
      super.ready();

      this.prepCanvases();

      // Attach replicant change listeners.
      games.on('change', this.currentGamesChanged.bind(this));
      gameAudioChannels.on('change', this.gameAudioChannelsChanged.bind(this));
    }

    prepCanvases() {
      // Prep canvases
      const leftCapStage = new createjs.Stage(this.$.leftCap);
      const rightCapStage = new createjs.Stage(this.$.rightCap);
      createjs.Ticker.setFPS(60);
      createjs.Ticker.on('tick', () => {
        if (this.attachRight || !this.attachLeft) {
          leftCapStage.update();
        }

        if (this.attachLeft || !this.attachRight) {
          rightCapStage.update();
        }
      });

      const _anims = {
        // start, end, next*, speed*
        open: [0, 37, 'opened'],
        close: {
          frames: [...Array(21).keys()].reverse(),
          next: 'closed',
        },
        opened: 37,
        closed: 0,
      };

      const leftCapSprite = new createjs.Sprite(new createjs.SpriteSheet({
        images: ['elements/games/mgt-game-bar/img/leftCap.png'],
        frames: [
          [2, 2, 30, 78, 0, -62, 0],
          [36, 2, 24, 78, 0, -58, 0],
          [74, 2, 38, 78, 0, -54, 0],
          [116, 2, 42, 78, 0, -50, 0],
          [162, 2, 46, 78, 0, -46, 0],
          [212, 2, 48, 78, 0, -44, 0],
          [264, 2, 52, 78, 0, -40, 0],
          [320, 2, 56, 78, 0, -36, 0],
          [380, 2, 60, 78, 0, -32, 0],
          [444, 2, 64, 78, 0, -28, 0],
          [512, 2, 66, 78, 0, -26, 0],
          [582, 2, 70, 78, 0, -22, 0],
          [656, 2, 72, 78, 0, -20, 0],
          [732, 2, 76, 78, 0, -16, 0],
          [812, 2, 78, 78, 0, -14, 0],
          [894, 2, 80, 78, 0, -12, 0],
          [2, 84, 82, 78, 0, -10, 0],
          [88, 84, 84, 78, 0, -8, 0],
          [176, 84, 86, 78, 0, -6, 0],
          [266, 84, 86, 78, 0, -6, 0],
          [356, 84, 86, 78, 0, -6, 0],
          [356, 84, 86, 78, 0, -6, 0],
          [356, 84, 86, 78, 0, -6, 0],
          [446, 84, 86, 78, 0, -6, 0],
          [536, 84, 86, 78, 0, -6, 0],
          [626, 84, 86, 78, 0, -6, 0],
          [716, 84, 86, 78, 0, -6, 0],
          [806, 84, 86, 78, 0, -6, 0],
          [2, 166, 86, 78, 0, -6, 0],
          [92, 166, 86, 78, 0, -6, 0],
          [182, 166, 86, 78, 0, -6, 0],
          [272, 166, 86, 78, 0, -6, 0],
          [362, 166, 86, 78, 0, -6, 0],
          [452, 166, 86, 78, 0, -6, 0],
          [542, 166, 86, 78, 0, -6, 0],
          [632, 166, 86, 78, 0, -6, 0],
          [722, 166, 86, 78, 0, -6, 0],
          [812, 166, 86, 78, 0, -6, 0],
        ],
        animations: _anims,
      }));

      const rightCapSprite = new createjs.Sprite(new createjs.SpriteSheet({
        images: ['elements/games/mgt-game-bar/img/rightCap.png'],
        frames: [
          [2, 2, 38, 78, 0, 0, 0],
          [44, 2, 42, 78, 0, 0, 0],
          [90, 2, 46, 78, 0, 0, 0],
          [140, 2, 50, 78, 0, 0, 0],
          [194, 2, 54, 78, 0, 0, 0],
          [252, 2, 56, 78, 0, 0, 0],
          [312, 2, 60, 78, 0, 0, 0],
          [376, 2, 64, 78, 0, 0, 0],
          [444, 2, 68, 78, 0, 0, 0],
          [516, 2, 72, 78, 0, 0, 0],
          [592, 2, 74, 78, 0, 0, 0],
          [670, 2, 78, 78, 0, 0, 0],
          [752, 2, 80, 78, 0, 0, 0],
          [836, 2, 84, 78, 0, 0, 0],
          [924, 2, 86, 78, 0, 0, 0],
          [2, 84, 88, 78, 0, 0, 0],
          [94, 84, 90, 78, 0, 0, 0],
          [188, 84, 92, 78, 0, 0, 0],
          [284, 84, 92, 78, 0, 0, 0],
          [380, 84, 92, 78, 0, 0, 0],
          [476, 84, 92, 78, 0, 0, 0],
          [476, 84, 92, 78, 0, 0, 0],
          [476, 84, 92, 78, 0, 0, 0],
          [476, 84, 92, 78, 0, 0, 0],
          [572, 84, 92, 78, 0, 0, 0],
          [668, 84, 92, 78, 0, 0, 0],
          [764, 84, 92, 78, 0, 0, 0],
          [860, 84, 92, 78, 0, 0, 0],
          [2, 166, 92, 78, 0, 0, 0],
          [98, 166, 92, 78, 0, 0, 0],
          [194, 166, 92, 78, 0, 0, 0],
          [290, 166, 92, 78, 0, 0, 0],
          [386, 166, 92, 78, 0, 0, 0],
          [482, 166, 92, 78, 0, 0, 0],
          [578, 166, 92, 78, 0, 0, 0],
          [674, 166, 92, 78, 0, 0, 0],
          [770, 166, 92, 78, 0, 0, 0],
          [866, 166, 92, 78, 0, 0, 0],
        ],
        animations: _anims,
      }));

      leftCapSprite.gotoAndStop(0);
      rightCapSprite.gotoAndStop(0);

      leftCapStage.addChild(leftCapSprite);
      rightCapStage.addChild(rightCapSprite);

      this._leftCapSprite = leftCapSprite;
      this._rightCapSprite = rightCapSprite;
    }

    currentGamesChanged(value) {
      this._games = value;
    }

    gameAudioChannelsChanged(newVal) {
      if (!newVal || newVal.length <= 0) {
        return;
      }

      const audio = newVal[this.index];
      this.audio = !audio.muted && !audio.fadedBelowThreshold;
    }

    computeText(index, type, _games) {
      if (!_games) {
        return '';
      }
      type = validateType(type, TYPE_RUNNER);
      let game = _games[index];
      let key = {};
      key[TYPE_GAME] = 'game';
      key[TYPE_RUNNER] = 'runner';
      key[TYPE_CATEGORY] = 'category';
      if (game && game[key[type]]) {
        return game[key[type]];
      }
      return '?';
    }

    computeTextColor(index, _games) {
      if (!_games) {
        return '';
      }
      let game = _games[index];
      if (game && game.color) {
        return game.color;
      }
      return '';
    }

    fitText() {
      Polymer.RenderStatus.afterNextRender(this, () => {
        const MAX_NAME_WIDTH = this.$.body.clientWidth - 32;
        const nameWidth = this.$.text.clientWidth;
        if (nameWidth > MAX_NAME_WIDTH) {
          TweenLite.set(this.$.text, {scaleX: MAX_NAME_WIDTH / nameWidth});
        } else {
          TweenLite.set(this.$.text, {scaleX: 1});
        }
      });
    }

    hiddenLeft(attachLeft, attachRight) {
      return attachLeft && !attachRight;
    }

    hiddenRight(attachLeft, attachRight) {
      return attachRight && !attachLeft;
    }
  }

  customElements.define(MgtGameBar.is, MgtGameBar);
})();
