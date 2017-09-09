(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');
  const livesplitTimer = nodecg.Replicant('livesplit-timer');

  class LiveSplitRunPrediction extends LiveSplitInfoComponent {
    static get is() {
      return 'ls-run-prediction';
    }

    static get properties() {
      return {
        secondsPrecision: {
          type: Number,
          value: 0,
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
          computed: 'computeText(name, comparison)',
        },
        value: {
          type: String,
          computed: 'computeTimer(comparison, _liveSplit, _timeData, ' +
              'secondsPrecision)',
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

    computeText(name, comparison) {
      if (name) {
        return name;
      }

      switch (comparison) {
        case null:
        case 'Personal Best':
          return 'Current Pace';
        case 'Best Segments':
          return 'Best Possible Time';
        case 'Worst Segments':
          return 'Worst Possible Time';
        case 'Average Segments':
          return 'Predicted Time';
        default:
          return 'Current Pace (' + comparison + ')';
      }
    }

    computeTimer(comparison, _liveSplit, _timeData, secondsPrecision) {
      if (!_liveSplit || !_timeData) {
        return '';
      }
      let options = {
        secondsPrecision,
      };
      comparison = _liveSplit.validateComparison(comparison);
      const {timingMethod, timerState, splitIndex, currentSplit,
        lastSplit} = _liveSplit;
      let time;
      if (this.computeText(null, comparison).startsWith('Current Pace') &&
          timerState == 'NotRunning') {
        time = null;
      } else if (timerState == 'Running' || timerState == 'Paused') {
        let delta = _liveSplit.lastDelta(splitIndex, comparison, timingMethod);
        delta = delta != null ? delta : 0;
        let liveDelta = subtractNull(
            _liveSplit.calcCurrentTime(_timeData, timingMethod),
            currentSplit.comparisons[comparison][timingMethod]);
        if (liveDelta != null && delta != null && liveDelta > delta) {
          delta = liveDelta;
        }
        time = lastSplit.comparisons[comparison][timingMethod] +
            delta;
      } else if (timerState == 'Ended') {
        time = lastSplit.splitTime[timingMethod];
      } else {
        time = lastSplit.comparisons[comparison][timingMethod];
      }
      return formatMilliseconds(time, options).join('');
    }
  }

  customElements.define(LiveSplitRunPrediction.is, LiveSplitRunPrediction);
})();
