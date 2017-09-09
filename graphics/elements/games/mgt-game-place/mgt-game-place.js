(function() {
  'use strict';

  const NAME_FADE_DURATION = 0.33;
  const NAME_FADE_IN_EASE = Power1.easeOut;
  const NAME_FADE_OUT_EASE = Power1.easeIn;
  const currentRun = nodecg.Replicant('currentRun');
  const stopwatch = nodecg.Replicant('stopwatch');
  const gameAudioChannels = nodecg.Replicant('gameAudioChannels');

  class MgtGamePlace extends Polymer.Element {
    static get is() {
      return 'mgt-game-place';
    }

    static get properties() {
      return {
        index: {
          type: Number,
          reflectToAttribute: true,
        },
        forfeit: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
        },
        time: String,
        place: Number,

        attach: {
          type: String,
          value: 'left',
          reflectToAttribute: true,
        },

        timeTL: {
          type: TimelineLite,
          value() {
            return new TimelineLite({autoRemoveChildren: true});
          },
          readOnly: true,
        },
      };
    }

    showTime() {
      if (this._timeShowing) {
        return;
      }

      this._timeShowing = true;

      this.timeTL.clear();
      this.timeTL.call(() => {
        this.$.timeShine.style.width = '140%';
        let path;
        if (this.attach == 'left') {
          path = 'polygon(0 0, 140% 0%, calc(140% - 30px) 100%, 0% 100%)';
        } else {
          path = 'polygon(-40% 0, 100% 0, 100% 100%, calc(-40% + 30px) 100%)';
        }
        this.$.timeClip.style.webkitClipPath = path;
      });

      this.timeTL.set(this.$.timeShine, {transition: 'none', width: 0}, '+=1');
      this.timeTL.set(this.$.medal, {zIndex: 1});
      this.timeTL.set(this.$.timeShine, {
        transition: 'width 400ms linear',
        width: '140%',
        opacity: 0.5,
      });
      this.timeTL.set(this.$.medal, {className: '+=shine'}, '+=0.25');
      this.timeTL.set(this.$.medal, {className: '-=shine'}, '+=0.35');
    }

    hideTime() {
      if (!this._timeShowing) {
        return;
      }

      this._timeShowing = false;

      this.timeTL.clear();
      this.timeTL.set(this.$.medal, {clearProps: 'zIndex'});
      this.timeTL.set(this.$.timeShine, {
        width: 0,
        clearProps: 'opacity',
        transition: 'width 325ms ease-in',
      });
      this.timeTL.set(this.$.timeClip, {
        clearProps: 'webkitClipPath',
        transition: '-webkit-clip-path 325ms ease-in',
      });
    }

    calcMedalImage(place, forfeit) {
      if (forfeit) {
        this.showTime();
        return 'elements/games/mgt-game-place/img/medal-fail.png';
      }

      switch (place) {
        case 1:
          this.showTime();
          return 'elements/games/mgt-game-place/img/medal-gold.png';
        case 2:
          this.showTime();
          return 'elements/games/mgt-game-place/img/medal-silver.png';
        case 3:
          this.showTime();
          return 'elements/games/mgt-game-place/img/medal-bronze.png';
        case 4:
          this.showTime();
          return '';
        default:
          this.hideTime();
          return '';
      }
    }

    ready() {
      super.ready();
    }
  }

  customElements.define(MgtGamePlace.is, MgtGamePlace);
})();
