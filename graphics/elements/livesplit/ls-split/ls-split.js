(function() {
  'use strict';

  class LiveSplitSplit extends LiveSplitIndexableSplit {
    static load() {
      LiveSplitSplit._instances = [];
      nodecg.listenFor('livesplit-split', () => {
        LiveSplitSplit._instances.forEach((self) => {
          self.resetScrollOffset();
        });
      });
      nodecg.listenFor('livesplit-skip-split', () => {
        LiveSplitSplit._instances.forEach((self) => {
          self.resetScrollOffset();
        });
      });
      nodecg.listenFor('livesplit-undo-split', () => {
        LiveSplitSplit._instances.forEach((self) => {
          self.resetScrollOffset();
        });
      });
      nodecg.listenFor('livesplit-reset', () => {
        LiveSplitSplit._instances.forEach((self) => {
          self.resetScrollOffset();
        });
      });
      nodecg.listenFor('livesplit-start', () => {
        LiveSplitSplit._instances.forEach((self) => {
          self.resetScrollOffset();
        });
      });
      nodecg.listenFor('livesplit-run-manually-modified', () => {
        LiveSplitSplit._instances.forEach((self) => {
          self.resetScrollOffset();
        });
      });
      nodecg.listenFor('livesplit-scroll', (data) => {
        LiveSplitSplit._instances.forEach((self) => {
          let direction = data.data;
          if (direction == 'up') {
            self.scrollUp();
          } else if (direction == 'down') {
            self.scrollDown();
          }
        });
      });
    }

    static get is() {
      return 'ls-split';
    }

    static get properties() {
      return {
        index: {
          type: Number,
          computed: 'computeActualIndex(_liveSplit, visibleIndex, ' +
              'scrollOffset, numVisibleSplits, numStartSplits, ' +
              'numLastSplits, lookAhead)',
        },
        visibleIndex: {
          type: Number,
        },
        numVisibleSplits: {
          type: Number,
          value: 1,
        },
        numStartSplits: {
          type: Number,
          value: 0,
        },
        numLastSplits: {
          type: Number,
          value: 0,
        },
        lookAhead: {
          type: Number,
          value: 0,
        },
        scrollOffset: {
          type: Number,
          value: 0,
          readOnly: true,
        },
      };
    }

    ready() {
      super.ready();
      LiveSplitSplit._instances.push(this);
    }

    resetScrollOffset() {
      this._setScrollOffset(0);
    }

    scrollUp() {
      let {_liveSplit, scrollOffset, numVisibleSplits, numStartSplits,
          numLastSplits, lookAhead} = this;
      numStartSplits = numStartSplits || 0;
      numLastSplits = numLastSplits || 0;
      lookAhead = lookAhead || 0;
      let numSplits = _liveSplit.splits.length;
      let showNumSplits = numVisibleSplits - numLastSplits;
      let splitIndex = Math.min(
          Math.max(_liveSplit.splitIndex, 0),
          numSplits - numLastSplits - lookAhead - 1);
      let limit = Math.min(showNumSplits - splitIndex - lookAhead - 1, 0);
      let offset = Math.max(scrollOffset - 1, limit);
      this._setScrollOffset(offset);
    }

    scrollDown() {
      let {_liveSplit, scrollOffset, numVisibleSplits, numStartSplits,
          numLastSplits, lookAhead} = this;
      numStartSplits = numStartSplits || 0;
      numLastSplits = numLastSplits || 0;
      lookAhead = lookAhead || 0;
      let startingOffset = numVisibleSplits - 1 - numLastSplits - lookAhead;
      let numSplits = _liveSplit.splits.length;
      let splitIndexOrBegin = Math.max(
          _liveSplit.splitIndex + 1,
          numVisibleSplits - numLastSplits
      );
      let zeroIndex = Math.max(0, _liveSplit.splitIndex - startingOffset);
      let lookingAhead = Math.min(lookAhead, zeroIndex);
      let limit = Math.max(
        0, numSplits - numLastSplits - splitIndexOrBegin - lookingAhead);
      let offset = Math.min(scrollOffset + 1, limit);
      this._setScrollOffset(offset);
    }

    computeActualIndex(
        _liveSplit, visibleIndex, scrollOffset, numVisibleSplits,
        numStartSplits, numLastSplits, lookAhead) {
      if (!_liveSplit) {
        return undefined;
      }
      if (!numVisibleSplits) {
        return undefined;
      }
      if ((typeof visibleIndex) == 'undefined') {
        return undefined;
      }
      numStartSplits = numStartSplits || 0;
      numLastSplits = numLastSplits || 0;
      lookAhead = lookAhead || 0;
      let startingOffset = numVisibleSplits - 1 - numLastSplits - lookAhead;
      let numSplits = _liveSplit.splits.length;
      let zeroIndex = Math.max(0, _liveSplit.splitIndex - startingOffset);
      let maxStartIndex = Math.max(0, numSplits - numVisibleSplits);
      let trueStartIndex = Math.min(zeroIndex, maxStartIndex);
      if (visibleIndex < numStartSplits) {
        return visibleIndex;
      } else if (visibleIndex >= numVisibleSplits - numLastSplits) {
        return numSplits + visibleIndex - numVisibleSplits;
      } else {
        if (trueStartIndex + visibleIndex < numSplits - numLastSplits) {
          return trueStartIndex + scrollOffset + visibleIndex;
        } else {
          return undefined;
        }
      }
    }
  }

  LiveSplitSplit.load();
  customElements.define(LiveSplitSplit.is, LiveSplitSplit);
})();
