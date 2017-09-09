(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');
  const livesplitTimer = nodecg.Replicant('livesplit-timer');

  class LiveSplitPreviousSegment extends LiveSplitInfoComponent {
    static get is() {
      return 'ls-previous-segment';
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
        useBestSegment: {
          type: Boolean,
          value: false,
        },
        showTimeSave: {
          type: Boolean,
          value: false,
        },
        timeSavePrecision: {
          type: Number,
          value: 0,
        },
        name: {
          type: String,
          value: null,
        },
        text: {
          type: String,
          computed: 'computeText(name, comparison, useBestSegment, ' +
              '_liveSplit, _timeData)',
        },
        value: {
          type: String,
          computed: 'computeTimer(comparison, _liveSplit, _timeData, ' +
              'secondsPrecision, showSecondsPrecision, showTimeSave, ' +
              'timeSavePrecision, useBestSegment)',
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

    computeText(name, comparison, useBestSegment, _liveSplit, _timeData) {
      if (!_liveSplit || !_timeData) {
        return '';
      }
      if (name) {
        return name;
      }

      let addendum = comparison == null ? '' : ' (' + comparison + ')';
      comparison = _liveSplit.validateComparison(comparison);
      const {timingMethod, timerState} = _liveSplit;
      let liveSeg = false;
      if (timerState != 'NotRunning') {
        if (timerState == 'Running' || timerState == 'Paused') {
          let liveDelta = _liveSplit.checkLiveDelta(
              _timeData, useBestSegment, false, comparison, timingMethod);
          if (liveDelta != null) {
            liveSeg = true;
          }
        }
        if (liveSeg) {
          return 'Live Segment' + addendum;
        }
      }
      return 'Previous Segment' + addendum;
    }

    computeTimer(
        comparison, _liveSplit, _timeData, secondsPrecision,
        showSecondsPrecision, showTimeSave, timeSavePrecision, useBestSegment) {
      if (!_liveSplit || !_timeData) {
        return '';
      }
      comparison = _liveSplit.validateComparison(comparison);
      const {timingMethod, splitIndex, timerState} = _liveSplit;
      let options = {
        secondsPrecision,
        showSecondsPrecision,
      };
      let saveOptions = {
        secondsPrecision: timeSavePrecision,
        showSecondsPrecision,
      };
      let timeChange = null;
      let timeSave = null;
      let liveSeg = false;

      if (timerState != 'NotRunning') {
        if (timerState == 'Running' || timerState == 'Paused') {
          let liveDelta = _liveSplit.checkLiveDelta(
              _timeData, useBestSegment, false, comparison, timingMethod);
          if (liveDelta != null) {
            liveSeg = true;
          }
        }
        if (liveSeg) {
          timeChange = _liveSplit.liveSegmentDelta(
              _timeData, splitIndex, comparison, timingMethod);
          timeSave = this.possibleTimeSave(
              _timeData, _liveSplit, splitIndex, comparison, timingMethod);
        } else if (splitIndex > 0) {
          timeChange = _liveSplit.previousSegmentDelta(
              _timeData, splitIndex - 1, comparison, timingMethod);
          timeSave = this.possibleTimeSave(
              _timeData, _liveSplit, splitIndex - 1, comparison, timingMethod);
        }
      }

      let strSave = '';
      if (showTimeSave) {
        strSave = '/' + formatDeltaMilliseconds(timeSave, saveOptions);
      }
      return formatDeltaMilliseconds(timeChange, options) + strSave;
    }

    possibleTimeSave(
        _timeData, _liveSplit, splitIndex, comparison, timingMethod) {
      let prevTime = 0;
      let split = _liveSplit.currentSplit;
      let bestSegments = split.bestSegment[timingMethod];

      while (splitIndex > 0 && bestSegments != null) {
        let split = _liveSplit.splits[splitIndex - 1];
        let splitTime = split.comparisons[comparison][timingMethod];
        if (splitTime != null) {
          prevTime = splitTime;
          break;
        } else {
          splitIndex--;
          bestSegments += split.bestSegment[timingMethod];
        }
      }

      split = _liveSplit.splits[splitIndex];
      let time = subtractNull(
          subtractNull(
            split.comparisons[comparison][timingMethod],
            prevTime),
          bestSegments);

      if (time != null && time < 0) {
        time = 0;
      }

      return time;
    }

    computeTimeClass(comparison, _liveSplit, _timeData, useBestSegment) {
      if (!_liveSplit || !_timeData) {
        return undefined;
      }
      comparison = _liveSplit.validateComparison(comparison);
      const {timingMethod, splitIndex, timerState} = _liveSplit;
      let timeChange = null;
      let liveSeg = false;
      let status = null;

      if (timerState != 'NotRunning') {
        if (timerState == 'Running' || timerState == 'Paused') {
          let liveDelta = _liveSplit.checkLiveDelta(
              _timeData, useBestSegment, false, comparison, timingMethod);
          if (liveDelta != null) {
            liveSeg = true;
          }
        }
        if (liveSeg) {
          timeChange = _liveSplit.liveSegmentDelta(
              _timeData, splitIndex, comparison, timingMethod);
        } else if (splitIndex > 0) {
          timeChange = _liveSplit.previousSegmentDelta(
              _timeData, splitIndex - 1, comparison, timingMethod);
        }
        if (timeChange != null) {
          if (liveSeg) {
            status = _liveSplit.splitColor(
                _timeData, timeChange, splitIndex, false, false, comparison,
                timingMethod);
          } else {
            status = _liveSplit.splitColor(
                _timeData, timeChange, splitIndex - 1, false, true, comparison,
                timingMethod);
          }
        } else {
          status = _liveSplit.splitColor(
              _timeData, null, splitIndex - 1, true, true, comparison,
              timingMethod);
        }
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
      if (status == BEST_SEGMENT) {
        return 'best-segment';
      }
      return undefined;
    }
  }

  customElements.define(LiveSplitPreviousSegment.is, LiveSplitPreviousSegment);
})();
