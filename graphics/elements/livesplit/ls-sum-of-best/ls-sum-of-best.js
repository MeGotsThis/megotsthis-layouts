(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');

  class LiveSplitSumOfBest extends LiveSplitInfoComponent {
    static get is() {
      return 'ls-sum-of-best';
    }

    static get properties() {
      return {
        secondsPrecision: {
          type: Number,
          value: 0,
        },
        advanced: {
          type: Boolean,
          value: false,
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
          computed: 'computeTimer(advanced, _liveSplit, secondsPrecision)',
        },
      };
    }

    ready() {
      super.ready();
      this._liveSplit = null;
      livesplit.on('change', this.livesplitChanged.bind(this));
    }

    livesplitChanged(value) {
      if (!('run' in value)) {
        return;
      }
      this._liveSplit = new LiveSplit(value);
    }

    computeText(name, comparison) {
      if (name) {
        return name;
      }

      return 'Sum of Best';
    }

    computeTimer(advanced, _liveSplit, secondsPrecision) {
      if (!_liveSplit) {
        return '';
      }
      const {timingMethod} = _liveSplit;
      let options = {
        secondsPrecision,
      };
      let time;
      if (advanced) {
        time = _liveSplit.run.advancedSumOfBest;
      } else {
        time = _liveSplit.calculateAllSumOfBest(true, timingMethod);
      }
      return formatMilliseconds(time, options).join('');
    }
  }

  customElements.define(LiveSplitSumOfBest.is, LiveSplitSumOfBest);
})();
