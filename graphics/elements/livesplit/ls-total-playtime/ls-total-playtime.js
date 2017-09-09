(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');
  const livesplitTimer = nodecg.Replicant('livesplit-timer');

  class LiveSplitTotalPlaytime extends LiveSplitInfoComponent {
    static get is() {
      return 'ls-total-playtime';
    }

    static get properties() {
      return {
        showDays: {
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
          computed: 'computeTimer(showDays, _liveSplit, _timeData)',
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

    computeText(name, comparison) {
      if (name) {
        return name;
      }

      return 'Total Playtime';
    }

    computeTimer(showDays, _liveSplit, _timeData) {
      if (!_liveSplit || !_timeData) {
        return '';
      }
      let options = {
        showDays,
        showMinutes: true,
      };
      let time = _liveSplit.run.totalPlaytime;
      time += _timeData.attempt - (_liveSplit.state.pauseTime || 0);
      return formatMilliseconds(time, options).join('');
    }
  }

  customElements.define(LiveSplitTotalPlaytime.is, LiveSplitTotalPlaytime);
})();
