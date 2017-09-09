(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');
  const livesplitTimer = nodecg.Replicant('livesplit-timer');

  class LiveSplitPossibleTimeSave extends LiveSplitInfoComponent {
    static get is() {
      return 'ls-possible-time-save';
    }

    static get properties() {
      return {
        secondsPrecision: {
          type: Number,
          value: 0,
        },
        total: {
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
          computed: 'computeText(name, total)',
        },
        value: {
          type: String,
          computed: 'computeTimer(total, comparison, _liveSplit, ' +
              '_timeData, secondsPrecision)',
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

    computeText(name, total) {
      if (name) {
        return name;
      }

      return total ? 'Total Possible Time Save' : 'Possible Time Save';
    }

    computeTimer(
        total, comparison, _liveSplit, _timeData, secondsPrecision) {
      if (!_liveSplit || !_timeData) {
        return '';
      }
      comparison = _liveSplit.validateComparison(comparison);
      let options = {
        secondsPrecision,
      };
      if (total) {
        if (_liveSplit.timerState == 'Ended') {
          return formatMilliseconds(0, options).join('');
        } else {
          let total = 0;
          for (let i = 0; i < _liveSplit.splits.length; i++) {
            if (i == _liveSplit.splitIndex) {
              continue;
            }
            let time = this.getPossibleTimeSave(_timeData, _liveSplit,
                i, comparison);
            if (time == null) {
              continue;
            }
            total += time;
          }
          return formatMilliseconds(total, options).join('');
        }
      } else {
        let isRunning = _liveSplit.timerState == 'Running' ||
            _liveSplit.timerState == 'Paused';
        if (isRunning) {
          let timeSave = this.getPossibleTimeSave(_timeData, _liveSplit,
              _liveSplit.state.currentSplitIndex, comparison);
          return formatMilliseconds(timeSave, options).join('');
        } else {
          return '-';
        }
      }
    }

    getPossibleTimeSave(
        _timeData, _liveSplit, splitIndex, comparison, live=false) {
      let segment = _liveSplit.splits[splitIndex];
      let prevTime = 0;
      const {timingMethod} = _liveSplit;
      let bestSegments = segment.bestSegment[timingMethod];

      while (splitIndex > 0 && bestSegments != null) {
        let prevSegment = _liveSplit.splits[splitIndex - 1];
        let splitTime = prevSegment.comparisons[comparison][timingMethod];
        if (splitTime != null) {
          prevTime = splitTime;
          break;
        } else {
          splitIndex--;
          bestSegments += prevSegment.bestSegment[timingMethod];
        }
      }

      let time = subtractNull(
          subtractNull(
            segment.comparisons[comparison][timingMethod], prevTime),
          bestSegments);

      if (live && splitIndex == _liveSplit.splitIndex) {
        let segmentData = subtractNull(0, _liveSplit.liveSegmentDelta(
            _timeData, splitIndex, comparison, timingMethod));
        if (segmentData != null && time != null && segmentData < time) {
            time = segmentData;
        }
      }

      if (time != null && time < 0) {
        time = 0;
      }

      return time;
    }
  }

  customElements.define(
      LiveSplitPossibleTimeSave.is, LiveSplitPossibleTimeSave);
})();
