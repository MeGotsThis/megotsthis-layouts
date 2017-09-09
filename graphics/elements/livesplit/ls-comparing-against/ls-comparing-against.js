(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');

  class LiveSplitComparingAgainst extends LiveSplitInfoComponent {
    static get is() {
      return 'ls-comparing-against';
    }

    static get properties() {
      return {
        name: {
          type: String,
          value: null,
        },
        text: {
          type: String,
          computed: 'computeText(name)',
        },
        value: {
          type: String,
          computed: 'computeValue(_liveSplit)',
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

    computeText(name) {
      if (name) {
        return name;
      }

      return 'Comparing Against';
    }

    computeValue(_liveSplit) {
      if (!_liveSplit) {
        return '';
      }
      return _liveSplit.comparison;
    }
  }

  customElements.define(
      LiveSplitComparingAgainst.is, LiveSplitComparingAgainst);
})();
