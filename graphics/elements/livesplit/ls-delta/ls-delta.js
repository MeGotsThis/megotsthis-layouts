(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');
  const livesplitTimer = nodecg.Replicant('livesplit-timer');

  class LiveSplitDelta extends LiveSplitInfoComponent {
    static get is() {
      return 'ls-delta';
    }

    static get properties() {
      return {
        secondsPrecision: {
          type: Number,
          value: 0,
        },
        showSecondsPrecision: {
          type: Boolean,
          value: false,
        },
        comparison: {
          type: String,
          value: null,
        },
        name: {
          type: String,
          value: null,
        },
        text: {
          type: String,
          computed: 'computeText(name, comparison, _liveSplit)',
        },
        value: {
          type: String,
          computed: 'computeTimer(comparison, _liveSplit, _timeData, ' +
              'secondsPrecision, showSecondsPrecision)',
        },
      };
    }

    ready() {
      super.ready();
      this._liveSplit = null;
      this._timeData = null;
      livesplit.on('change', this.livesplitChanged.bind(this));
      livesplitTimer.on('change', this.livesplitTimerChanged.bind(this));
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

    computeText(name, comparison, _liveSplit) {
      if (!_liveSplit) {
        return '';
      }
      if (name) {
        return name;
      }

      return _liveSplit.validateComparison(comparison);
    }

    computeTimer(
        comparison, _liveSplit, _timeData, secondsPrecision,
        showSecondsPrecision) {
      if (!_liveSplit || !_timeData) {
        return '';
      }
      comparison = _liveSplit.validateComparison(comparison);
      const {timingMethod, splitIndex, timerState, currentSplit,
          lastSplit} = _liveSplit;
      let options = {
        secondsPrecision,
        showSecondsPrecision,
      };

      let time = null;
      if (timerState == 'Running' || timerState == 'Paused') {
        let delta = _liveSplit.lastDelta(splitIndex, comparison, timingMethod);
        let liveDelta = subtractNull(
            _liveSplit.calcCurrentTime(_timeData, timingMethod),
            currentSplit.comparisons[comparison][timingMethod]);
        if ((liveDelta != null && delta != null && liveDelta > delta) ||
            (delta == null && liveDelta > 0)) {
          delta = liveDelta;
        }
        time = delta;
      } else if (timerState == 'Ended') {
        time = subtractNull(
            lastSplit.splitTime[timingMethod],
            lastSplit.comparisons[comparison][timingMethod]);
      }

      return formatDeltaMilliseconds(time, options);
    }

    computeTimeClass(comparison, _liveSplit, _timeData) {
      if (!_liveSplit || !_timeData) {
        return undefined;
      }
      comparison = _liveSplit.validateComparison(comparison);
      const {timingMethod, splitIndex, timerState, currentSplit,
          lastSplit} = _liveSplit;

      let time = null;
      let useLiveData = false;
      if (timerState == 'Running' || timerState == 'Paused') {
        let delta = _liveSplit.lastDelta(splitIndex, comparison, timingMethod);
        let liveDelta = subtractNull(
            _liveSplit.calcCurrentTime(_timeData, timingMethod),
            currentSplit.comparisons[comparison][timingMethod]);
        if ((liveDelta != null && delta != null && liveDelta > delta) ||
            (delta == null && liveDelta > 0)) {
          delta = liveDelta;
          useLiveData = true;
        }
        time = delta;
      } else if (timerState == 'Ended') {
        time = lastSplit.splitTime[timingMethod] -
            lastSplit.comparisons[comparison][timingMethod];
      }
      let status = _liveSplit.splitColor(
          _timeData, time, splitIndex - (!useLiveData), true, false,
          comparison, timingMethod);
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
      if (status == BEST_SEGMENT) {
        return 'best-segment';
      }
      return undefined;
    }
  }

  customElements.define(LiveSplitDelta.is, LiveSplitDelta);
})();
