(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');

  class LiveSplitTitle extends Polymer.Element {
    static get is() {
      return 'ls-title';
    }

    static get properties() {
      return {
        singleLine: {
          type: Boolean,
          value: false,
        },
        hideGame: {
          type: Boolean,
          value: false,
        },
        hideCategory: {
          type: Boolean,
          value: false,
        },
        hideIcon: {
          type: Boolean,
          value: false,
        },
        showAttemptCount: {
          type: Boolean,
          value: false,
        },
        showFinishedCount: {
          type: Boolean,
          value: false,
        },
        title: {
          type: String,
          computed: 'computeTitle(_liveSplit)',
        },
        category: {
          type: String,
          computed: 'computeCategory(_liveSplit)',
        },
        attempts: {
          type: String,
          computed: 'computeAttempts(_liveSplit, showAttemptCount, ' +
              'showFinishedCount)',
        },
        iconSrc: {
          type: String,
          computed: 'computeIcon(_liveSplit)',
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

    computeTitle(_liveSplit) {
      if (!_liveSplit) {
        return '';
      }

      return _liveSplit.run.gameName;
    }

    computeCategory(_liveSplit) {
      if (!_liveSplit) {
        return '';
      }

      return _liveSplit.run.categoryName;
    }

    computeAttempts(_liveSplit, showAttemptCount, showFinishedCount) {
      if (!_liveSplit) {
        return '';
      }

      let attempts = '';
      if (showFinishedCount) {
        attempts += _liveSplit.run.finishedCount;
      }
      if (showAttemptCount) {
        if (attempts) {
          attempts += '/';
        }
        attempts += _liveSplit.run.attemptCount;
      }

      return attempts;
    }

    computeIcon(_liveSplit) {
      if (!_liveSplit) {
        return '';
      }

      return _liveSplit.run.gameIcon || '';
    }

    _computeHide(...args) {
      for (let i = 0; i < args.length; i++) {
        if (args[i]) {
          return true;
        }
      }
      return false;
    }
  }

  customElements.define(LiveSplitTitle.is, LiveSplitTitle);
})();
