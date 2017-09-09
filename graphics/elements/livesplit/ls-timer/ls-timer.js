(function() {
  'use strict';

  const livesplitConnected = nodecg.Replicant('livesplit-connected');
  const livesplit = nodecg.Replicant('livesplit');
  const livesplitTimer = nodecg.Replicant('livesplit-timer');

  class LiveSplitTimer extends Polymer.Element {
    static get is() {
      return 'ls-timer';
    }

    static get properties() {
      return {
        secondsPrecision: {
          type: Number,
          value: 0,
        },
        showMinutes: {
          type: Boolean,
          value: false,
        },
        showHours: {
          type: Boolean,
          value: false,
        },
        twoPlaces: {
          type: Boolean,
          value: false,
        },

        currentMilliseconds: {
          computed: 'computeCurrentMilliseconds(_liveSplit, _timeData)',
        },
        currentTime: {
          computed: 'computeCurrentTime(currentMilliseconds, showHours, ' +
              'showMinutes, secondsPrecision, twoPlaces)',
        },
      };
    }

    ready() {
      super.ready();
      this._livesplitConnected = null;
      this._liveSplit = null;
      this._timeData = null;
      livesplit.on('change', this.livesplitChanged.bind(this));
      livesplitTimer.on('change', this.livesplitTimerChanged.bind(this));
      livesplitConnected.on('change',
        this.livesplitConnectedChanged.bind(this));
    }

    livesplitChanged(value) {
      if (!('run' in value)) {
        return;
      }
      this._liveSplit = new LiveSplit(value);
    }

    livesplitTimerChanged(value) {
      this._timeData = value;
    }

    computeCurrentMilliseconds(_liveSplit, _timeData) {
      if (!_liveSplit || !_timeData) {
        return 0;
      }
      return _liveSplit.calcCurrentTime(_timeData);
    }

    computeCurrentTime(
        currentMilliseconds, showHours, showMinutes, secondsPrecision,
        twoPlaces) {
      return formatMilliseconds(currentMilliseconds, {
        secondsPrecision, showMinutes, showHours, twoPlaces,
      });
    }

    livesplitConnectedChanged(value) {
      this._livesplitConnected = value;
    }

    _computeTimerClass(_livesplitConnected, _liveSplit, _timeData) {
      if (!_liveSplit || !_livesplitConnected || !_timeData) {
        return 'not-connected';
      }
      let status = _liveSplit.timeStatus(_timeData);
      if (status == NOT_RUNNING) {
        return 'not-running';
      }
      if (status == AHEAD_GAINING) {
        return 'ahead-gaining';
      }
      if (status == AHEAD_LOSING) {
        return 'ahead-losing';
      }
      if (status == BEHIND_GAINING) {
        return 'behind-gaining';
      }
      if (status == BEHIND_LOSING) {
        return 'behind-losing';
      }
      if (status == PAUSED) {
        return 'paused';
      }
      if (status == PERSONAL_BEST) {
        return 'personal-best';
      }
      return undefined;
    }
  }

  customElements.define(LiveSplitTimer.is, LiveSplitTimer);
})();
