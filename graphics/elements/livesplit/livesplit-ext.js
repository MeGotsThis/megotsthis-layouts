const NOT_RUNNING = 'NOT_RUNNING';
const AHEAD_GAINING = 'AHEAD_GAINING';
const AHEAD_LOSING = 'AHEAD_LOSING';
const BEHIND_GAINING = 'BEHIND_GAINING';
const BEHIND_LOSING = 'BEHIND_LOSING';
const PERSONAL_BEST = 'PERSONAL_BEST';
const PAUSED = 'PAUSED';
const BEST_SEGMENT = 'BEST_SEGMENT';

const TYPE_DELTA = 'Delta';
const TYPE_SPLIT_TIME = 'SplitTime';
const TYPE_DELTA_SPLIT = 'DeltaOrSplitTime';
const TYPE_SEGMENT_DELTA = 'SegmentDelta';
const TYPE_SEGMENT_TIME = 'SegmentTime';
const TYPE_SEGMENT_DELTA_TIME = 'SegmentDeltaOrTime';

let MAX_LISTENERS = 20;

nodecg.Replicant('livesplit-connected').setMaxListeners(MAX_LISTENERS);
nodecg.Replicant('livesplit').setMaxListeners(MAX_LISTENERS);
nodecg.Replicant('livesplit-timer').setMaxListeners(MAX_LISTENERS);

class LiveSplit {
  constructor(state) {
    if (!state) {
      throw state;
    }
    this.state = state;
  }

  get run() {
    return this.state.run;
  }

  get timerState() {
    return this.state.timerState;
  }

  get splitIndex() {
    return this.state.currentSplitIndex;
  }

  get splits() {
    return this.state.run.segments;
  }

  get currentSplit() {
    if (this.splitIndex < 0 ||
        this.splitIndex >= this.splits.length) {
      return undefined;
    }
    return this.splits[this.splitIndex];
  }

  get currentOrFinalSplitIndex() {
    if (this.splitIndex < 0) {
      return undefined;
    }
    if (this.splitIndex >= this.splits.length) {
      return this.splitIndex - 1;
    }
    return this.splitIndex;
  }

  get lastSplit() {
    if (this.splits.length == 0) {
      return undefined;
    }
    return this.splits[this.splits.length - 1];
  }

  get comparison() {
    return this.state.currentComparison;
  }

  get timingMethod() {
    let timingMethod = this.state.currentTimingMethod;
    if (timingMethod == 'GameTime') {
      timingMethod = 'RealTime';
    }
    return timingMethod == 'GameTime' ? 'gameTime' : 'realTime';
  }

  validateComparison(comparison) {
    if (this.run.comparisons.includes(comparison)) {
      return comparison;
    }
    return this.state.currentComparison;
  }

  validateTimingMethod(timingMethod) {
    if (timingMethod == 'gameTime' || timingMethod == 'realTime') {
      return timingMethod;
    }
    return this.timingMethod;
  }

  calcCurrentTime(timeData, timingMethod) {
    if (typeof timeData == 'undefined') {
      return undefined;
    }
    if (this.timerState == 'NotRunning') {
      return this.run.startingOffset;
    }
    timingMethod = timingMethod || this.timingMethod;
    return timeData.current[timingMethod || this.timingMethod];
  }

  calcSegmentTime(timeData, timingMethod) {
    if (typeof timeData == 'undefined') {
      return undefined;
    }
    if (this.timerState == 'NotRunning') {
      return this.run.startingOffset;
    }
    timingMethod = timingMethod || this.timingMethod;
    let lastSegment = 0;
    let runEndDelay = this.timerState == 'Ended' ? 1 : 0;
    if (this.splitIndex > 0 + runEndDelay) {
      let i = this.splitIndex - 1 - runEndDelay;
      if (this.splits[i].splitTime[timingMethod] != null) {
        lastSegment = this.splits[i].splitTime[timingMethod];
      } else {
        lastSegment = null;
      }
    }

    if (lastSegment != null) {
      return this.calcCurrentTime(timeData, timingMethod) - lastSegment;
    } else {
      return null;
    }
  }

  timeStatus(timeData) {
    let currentTime = this.calcCurrentTime(timeData);
    let {comparison, timingMethod} = this;
    if (this.timerState == 'NotRunning' || currentTime < 0) {
      return NOT_RUNNING;
    }
    if (this.timerState == 'Paused') {
      return PAUSED;
    }
    if (this.timerState == 'Ended') {
      let completedTime = this.lastSplit.comparisons[comparison][timingMethod];
      if (completedTime === null || currentTime < completedTime) {
        return PERSONAL_BEST;
      } else {
        return BEHIND_LOSING;
      }
    }
    if (this.timerState == 'Running') {
      let splitTime = this.currentSplit.comparisons[comparison][timingMethod];
      if (splitTime != null) {
        return this.splitColor(
           timeData, currentTime - splitTime, this.splitIndex, true, false,
           comparison, timingMethod) || AHEAD_GAINING;
      } else {
        return AHEAD_GAINING;
      }
    }
    return undefined;
  }

  deltaStatus(timeData, splitIndex, comparison, timingMethod) {
    let split = this.splits[splitIndex];
    let deltaTime = subtractNull(
        split.splitTime[timingMethod],
        split.comparisons[comparison][timingMethod]);
    return this.splitColor(
        timeData, deltaTime, splitIndex, true, true, comparison,
        timingMethod);
  }

  splitColor(
      timeData, timeDifference, splitIndex, showSegmentDelta,
      showBestSegment, comparison, timingMethod) {
    let color = null;
    if (splitIndex < 0) {
      return color;
    }

    if (timeDifference != null) {
      if (timeDifference < 0) {
        color = AHEAD_GAINING;
        let lastDelta = this.lastDelta(
            splitIndex - 1, comparison, timingMethod);
        if (showSegmentDelta && splitIndex > 0 && lastDelta != null &&
            timeDifference != null && timeDifference > lastDelta) {
          color = AHEAD_LOSING;
        }
      } else {
        color = BEHIND_LOSING;
        let lastDelta = this.lastDelta(
            splitIndex - 1, comparison, timingMethod);
        if (showSegmentDelta && splitIndex > 0 && lastDelta != null &&
            timeDifference != null && timeDifference < lastDelta) {
          color = BEHIND_GAINING;
        }
      }
    }

    if (showBestSegment &&
        this.checkBestSegment(timeData, splitIndex, timingMethod)) {
      color = BEST_SEGMENT;
    }

    return color;
  }

  lastDelta(splitIndex, comparison, timingMethod) {
    for (let x = splitIndex; x >= 0; x--) {
      let segment = this.splits[x];
      let comparisonTime = segment.comparisons[comparison][timingMethod];
      let splitTime = segment.splitTime[timingMethod];
      if (comparisonTime != null && splitTime != null) {
        return splitTime - comparisonTime;
      }
    }
    return null;
  }

  checkBestSegment(timeData, splitIndex, timingMethod) {
    let segment = this.splits[splitIndex];
    if (segment.splitTime[timingMethod] == null) {
      return false;
    }
    let delta = this.previousSegmentDelta(
        timeData, splitIndex, 'Best Segments', timingMethod);
    let curSegment = this.previousSegmentTime(
        timeData, splitIndex, timingMethod);
    let bestSegment = segment.bestSegment[timingMethod];
    return bestSegment == null || curSegment < bestSegment || delta < 0;
  }

  _segmentTimeOrSegmentDelta(
      timeData, splitIndex, useCurrentTime, segmentTime, comparison,
      timingMethod) {
    let segment = this.splits[splitIndex];
    let currentTime;
    if (useCurrentTime) {
      currentTime = this.calcCurrentTime(timeData, timingMethod);
    } else {
      currentTime = segment.splitTime[timingMethod];
    }
    if (currentTime == null) {
      return null;
    }

    for (let x = splitIndex - 1; x >= 0; x--) {
      let segmentPrev = this.splits[x];
      let splitTime = segmentPrev.splitTime[timingMethod];
      if (splitTime != null) {
        if (segmentTime) {
          return subtractNull(currentTime, splitTime);
        } else if (segmentPrev.comparisons[comparison][timingMethod] != null) {
          let time = segment.comparisons[comparison][timingMethod];
          let prevTime = segmentPrev.comparisons[comparison][timingMethod];
          let diffCurrent = subtractNull(currentTime, time);
          let diffSplit = subtractNull(splitTime, prevTime);
          return subtractNull(diffCurrent, diffSplit);
        }
      }
    }

    if (segmentTime) {
      return currentTime;
    } else {
      if (segment.comparisons[comparison][timingMethod] == null) {
        return null;
      }
      return currentTime - segment.comparisons[comparison][timingMethod];
    }
  }

  previousSegmentTime(timeData, splitIndex, timingMethod) {
    return this._segmentTimeOrSegmentDelta(
        timeData, splitIndex, false, true, 'Personal Best', timingMethod);
  }

  liveSegmentTime(timeData, splitIndex, timingMethod) {
    return this._segmentTimeOrSegmentDelta(
        timeData, splitIndex, true, true, 'Personal Best', timingMethod);
  }

  previousSegmentDelta(timeData, splitIndex, comparison, timingMethod) {
    return this._segmentTimeOrSegmentDelta(
        timeData, splitIndex, false, false, comparison, timingMethod);
  }

  liveSegmentDelta(timeData, splitIndex, comparison, timingMethod) {
    return this._segmentTimeOrSegmentDelta(
        timeData, splitIndex, true, false, comparison, timingMethod);
  }

  checkLiveDelta(
      timeData, useBestSegment, showWhenBehind, comparison, timingMethod) {
    if (this.timerState == 'Running' || this.timerState == 'Paused') {
      let curSplit = this.splits[this.splitIndex];
      let curSplitTime = curSplit.comparisons[comparison][timingMethod];
      let currentTime = this.calcCurrentTime(timeData, timingMethod);
      let curSegment = this.liveSegmentTime(
          timeData, this.splitIndex, timingMethod);
      let bestSegment = curSplit.bestSegment[timingMethod];
      let bestSegmentDelta = this.liveSegmentDelta(
          timeData, this.splitIndex, 'Best Segments', timingMethod);
      let comparisonDelta = this.liveSegmentDelta(
          timeData, this.splitIndex, comparison, timingMethod);

      if ((showWhenBehind && currentTime != null && curSplitTime != null &&
            currentTime > curSplitTime) ||
          (useBestSegment && bestSegment != null && curSegment > bestSegment &&
            bestSegmentDelta > 0) ||
          comparisonDelta > 0) {
        return subtractNull(currentTime, curSplitTime);
      }
    }
    return null;
  }

  trackCurrentRun(currentTime, segmentIndex, timingMethod) {
    let firstSplitTime = 0;
    if (segmentIndex > 0) {
      let prevSegment = this.state.run.segments[segmentIndex - 1];
      if (prevSegment.splitTime[timingMethod] == null) {
        return {realTime: null, gameTime: null, index: 0};
      }
      firstSplitTime = prevSegment.splitTime[timingMethod];
    }
    while (segmentIndex < this.state.run.segments.length) {
      let segment = this.state.run.segments[segmentIndex];
      let secondSplitTime = segment.splitTime[timingMethod];
      if (secondSplitTime != null) {
        let data = {index: segmentIndex + 1};
        data[timingMethod] = addNull(
          secondSplitTime - firstSplitTime, currentTime);
        return data;
      }
      segmentIndex++;
    }
    return {realTime: null, gameTime: null, index: 0};
  }

  trackPersonalBestRun(currentTime, segmentIndex, timingMethod) {
    let log = segmentIndex == 8;
    let firstSplitTime = 0;
    if (segmentIndex > 0) {
      let prevSegment = this.state.run.segments[segmentIndex - 1];
      if (prevSegment.personalBest[timingMethod] == null) {
        return {realTime: null, gameTime: null, index: 0};
      }
      firstSplitTime = prevSegment.personalBest[timingMethod];
    }
    while (segmentIndex < this.state.run.segments.length) {
      let segment = this.state.run.segments[segmentIndex];
      let secondSplitTime = segment.personalBest[timingMethod];
      if (secondSplitTime != null) {
        let data = {index: segmentIndex + 1};
        data[timingMethod] = addNull(
          secondSplitTime - firstSplitTime, currentTime);
        return data;
      }
      segmentIndex++;
    }
    return {realTime: null, gameTime: null, index: 0};
  }

  _populatePrediction(predictions, predictedTime, segmentIndex) {
    if (predictedTime != null &&
        (typeof predictions[segmentIndex] == 'undefined' ||
          predictions[segmentIndex] == null ||
          predictedTime < predictions[segmentIndex])) {
      predictions[segmentIndex] = predictedTime;
    }
  }

  _populatePredictions(
      currentTime, segmentIndex, predictions, useCurrentRun, timingMethod) {
    if (currentTime != null) {
      let segment = this.state.run.segments[segmentIndex];
      this._populatePrediction(
          predictions,
          addNull(currentTime, segment.bestSegment[timingMethod]),
          segmentIndex + 1);
      if (useCurrentRun) {
        let currentRunPrediction = this.trackCurrentRun(
            currentTime, segmentIndex, timingMethod);
        this._populatePrediction(
            predictions, currentRunPrediction[timingMethod],
            currentRunPrediction.index);
      }
      let personalBestRunPrediction = this.trackPersonalBestRun(
          currentTime, segmentIndex, timingMethod);
      this._populatePrediction(
          predictions, personalBestRunPrediction[timingMethod],
          personalBestRunPrediction.index);
    }
  }

  calculateSumOfBest(
      startIndex, endIndex, predictions, useCurrentRun=true, timingMethod) {
    predictions = predictions || [];
    let segmentIndex = 0;
    let currentTime = 0;
    predictions[startIndex] = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      currentTime = predictions[i];
      this._populatePredictions(
          currentTime, i, predictions, useCurrentRun, timingMethod);
    }
    return predictions[endIndex + 1];
  }

  calculateAllSumOfBest(useCurrentRun=true, timingMethod) {
    return this.calculateSumOfBest(
        0, this.state.run.segments.length - 1, undefined, useCurrentRun,
        timingMethod);
  }

  isValidSplitIndex(splitIndex) {
    if (typeof splitIndex == 'undefined') {
      return false;
    }
    if (splitIndex == null) {
      return false;
    }
    if (splitIndex < 0 || splitIndex >= this.state.run.segments.length) {
      return false;
    }
    return true;
  }

  static isValidType(type) {
    return [
      TYPE_DELTA, TYPE_SPLIT_TIME, TYPE_DELTA_SPLIT, TYPE_SEGMENT_DELTA,
      TYPE_SEGMENT_TIME, TYPE_SEGMENT_DELTA_TIME].includes(type);
  }
}

function addNull(...args) {
  let total = 0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] == null) {
      return null;
    }
    total += args[i];
  }
  return total;
}

function subtractNull(a, b) {
  if (a == null || b == null) {
    return null;
  }
  return a - b;
}

function formatMilliseconds(time, options={}) {
  if (time == null) {
    return ['-', ''];
  }
  let secondsPrecision = options.secondsPrecision || 0;
  let showMinutes = options.showMinutes || false;
  let showHours = options.showHours || false;
  let showDays = options.showDays || false;
  let twoPlaces = options.twoPlaces || false;
  let places;

  let timeStr = ['', ''];
  if (time < 0) {
    timeStr[0] = '-';
    time = -time;
  }
  showHours = showHours || time >= 60 * 60 * 1000;
  if (showHours) {
    if (showDays) {
      let days = (~~(time / (24 * 60 * 60 * 1000))) + '';
      time = time % (24 * 60 * 60 * 1000);
      timeStr[0] += days + 'd ';
    }
    let hours = (~~(time / (60 * 60 * 1000))) + '';
    time = time % (60 * 60 * 1000);
    places = twoPlaces ? 2 : 1;
    timeStr[0] += rightJustify(hours, places, '0') + ':';
  }
  showMinutes = showMinutes || showHours || time >= 60 * 1000;
  if (showMinutes) {
    let minutes = (~~(time / (60 * 1000))) + '';
    time = time % (60 * 1000);
    places = showHours || twoPlaces ? 2 : 1;
    timeStr[0] += rightJustify(minutes, places, '0') + ':';
  }
  let seconds = (~~(time / 1000)) + '';
  time = time % 1000;

  places = showHours || showMinutes || twoPlaces ? 2 : 1;
  timeStr[0] += rightJustify(seconds, places, '0');
  if (secondsPrecision > 0) {
    timeStr[1] = '.';
    if (secondsPrecision == 1) {
      timeStr[1] += leftJustify(~~(time / 100) + '', 1, '0');
    } else if (secondsPrecision == 2) {
      timeStr[1] += leftJustify(~~(time / 10) + '', 2, '0');
    } else {
      timeStr[1] += leftJustify(~~time + '', 3, '0');
    }
  }
  return timeStr;
}

function formatDeltaMilliseconds(time, options={}) {
  if (time == null) {
    return '-';
  }
  let secondsPrecision = options.secondsPrecision || 0;
  let showSecondsPrecision = options.showSecondsPrecision || false;
  let places;

  let timeStr = '';
  if (time < 0) {
    timeStr = '-';
    time = -time;
  } else {
    timeStr = '+';
  }
  let showHours = time >= 60 * 60 * 1000;
  if (showHours) {
    let hours = (~~(time / (60 * 60 * 1000))) + '';
    time = time % (60 * 60 * 1000);
    timeStr += rightJustify(hours, places, '0') + ':';
  }
  let showMinutes = showHours || time >= 60 * 1000;
  if (showMinutes) {
    let minutes = (~~(time / (60 * 1000))) + '';
    time = time % (60 * 1000);
    places = showHours ? 2 : 1;
    timeStr += rightJustify(minutes, places, '0') + ':';
  }
  let seconds = (~~(time / 1000)) + '';
  time = time % 1000;

  places = showHours || showMinutes ? 2 : 1;
  timeStr += rightJustify(seconds, places, '0');
  if ((showSecondsPrecision && !(showHours || showMinutes)) ||
      secondsPrecision > 0) {
    secondsPrecision = secondsPrecision > 0 ? secondsPrecision : 1;
    timeStr += '.';
    if (secondsPrecision == 1) {
      timeStr += leftJustify(~~(time / 100) + '', 1, '0');
    } else if (secondsPrecision == 2) {
      timeStr += leftJustify(~~(time / 10) + '', 2, '0');
    } else {
      timeStr += leftJustify(~~time + '', 3, '0');
    }
  }
  return timeStr;
}

function leftJustify(string, width, fill=' ') {
  while (string.length < width) {
    string = string + fill;
  }
  return string;
}

function rightJustify(string, width, fill=' ') {
  while (string.length < width) {
    string = fill + string;
  }
  return string;
}
