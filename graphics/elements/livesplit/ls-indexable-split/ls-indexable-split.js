'use strict';

class LiveSplitIndexableSplit extends Polymer.Element {
  static get is() {
    return 'ls-indexable-split';
  }

  static get properties() {
    return {
      index: {
        type: Number,
      },
      showBestSegment: {
        type: Boolean,
        value: false,
      },
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
      deltaSecondsPrecision: {
        type: Number,
        value: 0,
      },
      showDeltaSecondsPrecision: {
        type: Boolean,
        value: false,
      },
      hideIcon: {
        type: Boolean,
        value: false,
      },

      split: {
        computed: 'computeSplit(_liveSplit, index)',
      },

      column1Type: {
        type: String,
        value: TYPE_DELTA,
      },
      column1Comparison: {
        type: String,
        value: null,
      },
      column1TimingMethod: {
        type: String,
        value: null,
      },
      column1Value: {
        computed: 'computeColumnValue(_liveSplit, index, split, _timeData, ' +
            'column1Type, column1Comparison, column1TimingMethod, ' +
            'showBestSegment)',
      },
      column1Time: {
        computed: 'computeColumnTime(column1Value, secondsPrecision, ' +
            'showMinutes, showHours, twoPlaces, deltaSecondsPrecision, ' +
            'showDeltaSecondsPrecision)',
      },

      column2Type: {
        type: String,
        value: TYPE_SPLIT_TIME,
      },
      column2Comparison: {
        type: String,
        value: null,
      },
      column2TimingMethod: {
        type: String,
        value: null,
      },
      column2Value: {
        computed: 'computeColumnValue(_liveSplit, index, split, _timeData, ' +
            'column2Type, column2Comparison, column2TimingMethod, ' +
            'showBestSegment)',
      },
      column2Time: {
        computed: 'computeColumnTime(column2Value, secondsPrecision, ' +
            'showMinutes, showHours, twoPlaces, deltaSecondsPrecision, ' +
            'showDeltaSecondsPrecision)',
      },

      column3Type: {
        type: String,
        value: null,
      },
      column3Comparison: {
        type: String,
        value: null,
      },
      column3TimingMethod: {
        type: String,
        value: null,
      },
      column3Value: {
        computed: 'computeColumnValue(_liveSplit, index, split, _timeData, ' +
            'column3Type, column3Comparison, column3TimingMethod, ' +
            'showBestSegment)',
      },
      column3Time: {
        computed: 'computeColumnTime(column3Value, secondsPrecision, ' +
            'showMinutes, showHours, twoPlaces, deltaSecondsPrecision, ' +
            'showDeltaSecondsPrecision)',
      },

      column4Type: {
        type: String,
        value: null,
      },
      column4Comparison: {
        type: String,
        value: null,
      },
      column4TimingMethod: {
        type: String,
        value: null,
      },
      column4Value: {
        computed: 'computeColumnValue(_liveSplit, index, split, _timeData, ' +
            'column4Type, column4Comparison, column4TimingMethod, ' +
            'showBestSegment)',
      },
      column4Time: {
        computed: 'computeColumnTime(column4Value, secondsPrecision, ' +
            'showMinutes, showHours, twoPlaces, deltaSecondsPrecision, ' +
            'showDeltaSecondsPrecision)',
      },
    };
  }

  ready() {
    super.ready();
    const livesplitConnected = nodecg.Replicant('livesplit-connected');
    const livesplit = nodecg.Replicant('livesplit');
    const livesplitTimer = nodecg.Replicant('livesplit-timer');

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

  livesplitConnectedChanged(value) {
    this._livesplitConnected = value;
    this._livesplitNotConnected = !value;
  }

  computeSplit(_liveSplit, index) {
    if (!_liveSplit || !_liveSplit.splits[index]) {
      return {
        invalid: true,
        name: undefined,
        icon: '',
      };
    }
    return Object.assign({}, _liveSplit.splits[index], {
      icon: _liveSplit.splits[index].icon || '',
    });
  }

  isValidType(type) {
    return LiveSplit.isValidType(type);
  }

  colorClassName(color) {
    if (color == AHEAD_GAINING) {
      return 'ahead-gaining';
    }
    if (color == AHEAD_LOSING) {
      return 'ahead-losing';
    }
    if (color == BEHIND_GAINING) {
      return 'behind-gaining';
    }
    if (color == BEHIND_LOSING) {
      return 'behind-losing';
    }
    if (color == BEST_SEGMENT) {
      return 'best-segment';
    }
    return undefined;
  }

  computeColumnValue(
      _liveSplit, index, split, _timeData, type, comparison, timingMethod,
      showBestSegment) {
    if (_liveSplit && _liveSplit.isValidSplitIndex(index) && !split.invalid) {
      let {splitIndex} = _liveSplit;
      comparison = _liveSplit.validateComparison(comparison);
      timingMethod = _liveSplit.validateTimingMethod(timingMethod);
      if (index < splitIndex) {
        let splitTime = split.splitTime[timingMethod];
        let deltaTime = subtractNull(
            split.splitTime[timingMethod],
            split.comparisons[comparison][timingMethod]);
        let segmentTime = _liveSplit.previousSegmentTime(
            _timeData, index, timingMethod);
        let segmentDelta = _liveSplit.previousSegmentDelta(
            _timeData, index, comparison, timingMethod);
        if (type == TYPE_SPLIT_TIME || type == TYPE_SEGMENT_TIME) {
          let className = 'before-segment';
          if (type == TYPE_SPLIT_TIME) {
            return {time: splitTime, type: 'time', className};
          } else {
            return {time: segmentTime, type: 'time', className};
          }
        }
        if (type == TYPE_DELTA_SPLIT || type == TYPE_DELTA) {
          let color = _liveSplit.splitColor(
              _timeData, deltaTime, index, true, true, comparison,
              timingMethod);
          let className;
          if (color == null) {
            className = 'before-split';
          } else {
            className = this.colorClassName(color);
          }
          if (type == TYPE_DELTA_SPLIT) {
            if (deltaTime != null) {
              return {time: deltaTime, type: 'delta', className};
            } else {
              return {time: splitTime, type: 'time', className};
            }
          } else {
            return {time: deltaTime, type: 'delta', className};
          }
        }
        if (type == TYPE_SEGMENT_DELTA_TIME || type == TYPE_SEGMENT_DELTA) {
          let color = _liveSplit.splitColor(
              _timeData, segmentDelta, index, false, true, comparison,
              timingMethod);
          let className;
          if (color == null) {
            className = 'before-split';
          } else {
            className = this.colorClassName(color);
          }
          if (type == TYPE_SEGMENT_DELTA_TIME) {
            if (segmentDelta != null) {
              return {time: segmentDelta, type: 'delta', className};
            } else {
              return {time: segmentTime, type: 'time', className};
            }
          } else {
            return {time: segmentDelta, type: 'delta', className};
          }
        }
      } else {
        let time = undefined;
        if ([TYPE_SPLIT_TIME, TYPE_SEGMENT_TIME, TYPE_DELTA_SPLIT,
              TYPE_SEGMENT_DELTA_TIME].includes(type)) {
          let className = index == splitIndex ? 'current-split' : 'after-split';

          if (type == TYPE_SPLIT_TIME || type == TYPE_DELTA_SPLIT) {
            time = {
              time: split.comparisons[comparison][timingMethod],
              type: 'time',
              className,
            };
          } else {
            let previousTime = 0;
            for (let i = index - 1; i >= 0; i--) {
              let prevComparisons = _liveSplit.splits[i].comparisons;
              let comparisonTime = prevComparisons[comparison][timingMethod];
              if (comparisonTime != null) {
                previousTime = comparisonTime;
                break;
              }
            }
            time = {
              time: subtractNull(
                  split.comparisons[comparison][timingMethod],
                  previousTime),
              type: 'time',
              className,
            };
          }
        }

        let splitDelta = type == TYPE_DELTA_SPLIT || type == TYPE_DELTA;
        let bestDelta = _liveSplit.checkLiveDelta(
            _timeData, showBestSegment, splitDelta, comparison, timingMethod);
        if (bestDelta != null && index == splitIndex &&
            [TYPE_DELTA_SPLIT, TYPE_DELTA, TYPE_SEGMENT_DELTA_TIME,
              TYPE_SEGMENT_DELTA].includes(type)) {
          if (splitDelta) {
            time = {time: bestDelta, type: 'delta', className: 'delta'};
          } else {
            time = {
              time: _liveSplit.liveSegmentDelta(
                _timeData, index, comparison, timingMethod),
              type: 'delta',
              className: 'delta',
            };
          }
        } else if (type == TYPE_DELTA || type == TYPE_SEGMENT_DELTA) {
          time = undefined;
        }
        return time;
      }
    }
    return undefined;
  }

  computeColumnTime(
      value, secondsPrecision, showMinutes, showHours, twoPlaces,
      deltaSecondsPrecision, showDeltaSecondsPrecision) {
    if (!value) {
      return '';
    }
    if (value.type == 'time') {
      let timeOptions = {
        secondsPrecision,
        showMinutes,
        showHours,
        twoPlaces,
      };
      return formatMilliseconds(value.time, timeOptions).join('');
    }
    if (value.type == 'delta') {
      let deltaOptions = {
        secondsPrecision: deltaSecondsPrecision,
        showSecondsPrecision: showDeltaSecondsPrecision,
      };
      return formatDeltaMilliseconds(value.time, deltaOptions);
    }
    return '';
  }

  computeBoxClass(_liveSplit, index) {
    if (!_liveSplit) {
      return undefined;
    }
    if (!_liveSplit.isValidSplitIndex(index)) {
      return undefined;
    }
    let classes = [];
    if (index % 2 == 0) {
      classes.push('even-split');
    } else {
      classes.push('odd-split');
    }
    if (index == _liveSplit.splitIndex) {
      classes.push('active-split');
    }
    return classes.length > 0 ? classes.join(' ') : undefined;
  }
}

customElements.define(LiveSplitIndexableSplit.is, LiveSplitIndexableSplit);
