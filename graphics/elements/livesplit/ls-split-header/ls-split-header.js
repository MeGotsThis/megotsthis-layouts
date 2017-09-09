(function() {
  'use strict';

  class LiveSplitSplitHeader extends Polymer.Element {
    static get is() {
      return 'ls-split-header';
    }

    static get properties() {
      return {
        hideIcon: {
          type: Boolean,
          value: false,
        },

        column1Type: {
          type: String,
          value: TYPE_DELTA,
        },
        column1Comparison: {
          type: String,
          value: null,
        },
        column1Header: {
          type: String,
          value: '+/-',
        },
        column1Text: {
          computed: 'computeColumnText(_liveSplit, column1Header, ' +
              'column1Type, column1Comparison)',
        },

        column2Type: {
          type: String,
          value: TYPE_SPLIT_TIME,
        },
        column2Comparison: {
          type: String,
          value: null,
        },
        column2Header: {
          type: String,
          value: 'Time',
        },
        column2Text: {
          computed: 'computeColumnText(_liveSplit, column2Header, ' +
              'column2Type, column2Comparison)',
        },

        column3Type: {
          type: String,
          value: null,
        },
        column3Comparison: {
          type: String,
          value: null,
        },
        column3Header: {
          type: String,
          value: null,
        },
        column3Text: {
          computed: 'computeColumnText(_liveSplit, column3Header, ' +
              'column3Type, column3Comparison)',
        },

        column4Type: {
          type: String,
          value: null,
        },
        column4Comparison: {
          type: String,
          value: null,
        },
        column4Header: {
          type: String,
          value: null,
        },
        column4Text: {
          computed: 'computeColumnText(_liveSplit, column4Header, ' +
              'column4Type, column4Comparison)',
        },
      };
    }

    ready() {
      super.ready();
      let livesplit = nodecg.Replicant('livesplit');
      livesplit.on('change', this.livesplitChanged.bind(this));
    }

    livesplitChanged(value) {
      if (!('run' in value)) {
        return;
      }
      this._liveSplit = new LiveSplit(value);
    }

    isValidType(type) {
      return LiveSplit.isValidType(type);
    }

    computeColumnText(_liveSplit, header, type, comparison) {
      if (!_liveSplit) {
        return '';
      }

      if (header) {
        return header;
      }

      return _liveSplit.validateComparison(comparison);
    }
  }

  customElements.define(LiveSplitSplitHeader.is, LiveSplitSplitHeader);
})();
