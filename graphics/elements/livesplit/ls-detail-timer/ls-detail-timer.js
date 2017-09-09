(function() {
  'use strict';

  const livesplitConnected = nodecg.Replicant('livesplit-connected');
  const livesplit = nodecg.Replicant('livesplit');
  const livesplitTimer = nodecg.Replicant('livesplit-timer');

  class LiveSplitDetailTimer extends Polymer.Element {
    static get is() {
      return 'ls-detail-timer';
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
        segmentSecondsPrecision: {
          type: Number,
          value: 0,
        },
        showSegmentMinutes: {
          type: Boolean,
          value: false,
        },
        showSegmentHours: {
          type: Boolean,
          value: false,
        },
        twoPlaces: {
          type: Boolean,
          value: false,
        },

        hideIcon: {
          type: Boolean,
          value: false,
        },
        hideName: {
          type: Boolean,
          value: false,
        },
        hideComparison1: {
          type: Boolean,
          value: false,
        },
        hideComparison2: {
          type: Boolean,
          value: false,
        },
        hideSegmentTimer: {
          type: Boolean,
          value: false,
        },

        split: {
          computed: 'computeSplit(_liveSplit, index)',
        },

        timingMethod: {
          type: String,
          value: null,
        },

        comparison1: {
          type: String,
          value: null,
        },
        comparison2: {
          type: String,
          value: null,
        },
        comparison1Text: {
          type: String,
          value: null,
        },
        comparison2Text: {
          type: String,
          value: null,
        },
        _comparison1Text: {
          computed: 'computeComparisonText(_liveSplit, comparison1, ' +
              'comparison1Text)',
        },
        _comparison2Text: {
          computed: 'computeComparisonText(_liveSplit, comparison2, ' +
              'comparison2Text)',
        },
        comparison1Milliseconds: {
          computed: 'computeComparisonMilliseconds(_liveSplit, comparison1, ' +
              'timingMethod)',
        },
        comparison2Milliseconds: {
          computed: 'computeComparisonMilliseconds(_liveSplit, comparison2, ' +
              'timingMethod)',
        },
        comparison1Time: {
          computed: 'computeComparisonTime(_liveSplit, comparison1, ' +
              'timingMethod, showSegmentHours, showSegmentMinutes, ' +
              'segmentSecondsPrecision, twoPlaces)',
        },
        comparison2Time: {
          computed: 'computeComparisonTime(_liveSplit, comparison2, ' +
              'timingMethod, showSegmentHours, showSegmentMinutes, ' +
              'segmentSecondsPrecision, twoPlaces)',
        },

        currentMilliseconds: {
          computed: 'computeCurrentMilliseconds(_liveSplit, _timeData)',
        },
        currentTime: {
          computed: 'computeCurrentTime(currentMilliseconds, showHours, ' +
              'showMinutes, secondsPrecision, twoPlaces)',
        },
        segmentMilliseconds: {
          computed: 'computeSegmentMilliseconds(_liveSplit, _timeData)',
        },
        segmentTime: {
          computed: 'computeSegmentTime(segmentMilliseconds, ' +
              'showSegmentHours, showSegmentMinutes, ' +
              'segmentSecondsPrecision, twoPlaces)',
        },
      };
    }

    ready() {
      super.ready();
      this._isNotRunning = null;
      this._liveSplit = null;
      this._livesplitConnected = null;
      this._livesplitNotConnected = null;
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
      this._isNotRunning = this._liveSplit.state.timerState == 'NotRunning';
    }

    livesplitTimerChanged(value) {
      this._timeData = value;
    }

    livesplitConnectedChanged(value) {
      this._livesplitConnected = value;
      this._livesplitNotConnected = !value;
    }

    computeSplit(_liveSplit) {
      if (_liveSplit) {
        const splitIndex = _liveSplit.currentOrFinalSplitIndex;
        const split = _liveSplit.splits[splitIndex];
        if (split) {
          return Object.assign({}, split, {
            icon: _liveSplit.splits[splitIndex].icon || '',
          });
        }
      }
      return {
        name: undefined,
        icon: '',
      };
    }

    computeTimingMethod(_liveSplit, timingMethod) {
      if (!_liveSplit) {
        return undefined;
      }
      if (LiveSplit.isValidTimingMethod(timingMethod)) {
        return timingMethod;
      }
      return _liveSplit.timingMethod;
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

    computeSegmentMilliseconds(_liveSplit, _timeData) {
      if (!_liveSplit || !_timeData) {
        return 0;
      }
      return _liveSplit.calcSegmentTime(_timeData);
    }

    computeSegmentTime(
        segmentMilliseconds, showHours, showMinutes, secondsPrecision,
        twoPlaces) {
      if (segmentMilliseconds == null) {
        return ['-', ''];
      }
      return formatMilliseconds(segmentMilliseconds, {
        secondsPrecision, showMinutes, showHours, twoPlaces,
      });
    }

    computeComparisonText(_liveSplit, comparison, text) {
      if (text) {
        return text;
      }

      if (!_liveSplit) {
        return undefined;
      }

      return _liveSplit.validateComparison(comparison);
    }

    computeComparisonMilliseconds(
        _liveSplit, comparison, timingMethod) {
      if (!_liveSplit) {
        return null;
      }
      let splitIndex = _liveSplit.currentOrFinalSplitIndex;
      let split = _liveSplit.splits[splitIndex];
      if (!split) {
        return null;
      }
      timingMethod = _liveSplit.validateTimingMethod(timingMethod);
      comparison = _liveSplit.validateComparison(comparison);
      if (comparison == 'Best Segments') {
        return split.bestSegment[timingMethod];
      }
      if (splitIndex == 0) {
        return split.comparisons[comparison][timingMethod];
      }
      let prevSplit = _liveSplit.splits[splitIndex - 1];
      return subtractNull(
          split.comparisons[comparison][timingMethod],
          prevSplit.comparisons[comparison][timingMethod]);
    }

    computeComparisonTime(
        _liveSplit, comparison, timingMethod, showHours, showMinutes,
        secondsPrecision, twoPlaces) {
      let comparisonMilliseconds = this.computeComparisonMilliseconds(
          _liveSplit, comparison, timingMethod);
      if (comparisonMilliseconds == null ||
          typeof comparisonMilliseconds == 'undefined') {
        return '-';
      }
      return formatMilliseconds(comparisonMilliseconds, {
        secondsPrecision, showMinutes, showHours, twoPlaces,
      }).join('');
    }

    computeTimerClass(_livesplitConnected, _liveSplit, _timeData) {
      if (!_liveSplit || !_livesplitConnected) {
        return 'not-connected';
      }
      if (!_timeData) {
        return undefined;
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

    computeHideComarison2(
        _liveSplit, _livesplitNotConnected, _isNotRunning,
        hideComparison1, hideComparison2,
        comparison1, comparison2) {
      if (!_liveSplit) {
        return true;
      }
      if (_livesplitNotConnected || _isNotRunning || hideComparison2) {
        return true;
      }

      comparison1 = _liveSplit.validateComparison(comparison1);
      comparison2 = _liveSplit.validateComparison(comparison2);
      return comparison1 == comparison2 ? !hideComparison1 : false;
    }

    computeHide(...args) {
      for (let i = 0; i < args.length; i++) {
        if (args[i]) {
          return true;
        }
      }
      return false;
    }
  }

  customElements.define(LiveSplitDetailTimer.is, LiveSplitDetailTimer);
})();
