(function() {
  'use strict';

  const livesplitConnected = nodecg.Replicant('livesplit-connected');
  const livesplit = nodecg.Replicant('livesplit');

  class LiveSplitStatus extends Polymer.Element {
    static get is() {
      return 'ls-status';
    }

    static get properties() {
      return {};
    }

    ready() {
      super.ready();
      livesplitConnected.on('change', (value) => {
        this.connected = value ? 'Connected' : 'Not Connected';
        this.connectedColor = value ? 'green' : 'red';
        this.connectedWeight = value ? 'normal' : 'bold';
      });
      livesplit.on('change', (value) => {
        if (value.timerState) {
          switch (value.timerState) {
            case 'NotRunning':
              this.timerState = 'Not Running';
              break;
            case 'Running':
            case 'Paused':
              this.timerState = value.timerState;
              break;
            case 'Ended':
              this.timerState = 'Finished';
              break;
            default:
              this.timerState = value.timerState + '(Unknown)';
              break;
          }
        } else {
          if (livesplitConnected.value) {
            this.timerState = 'Connected';
          } else {
            this.timerState = 'Not Connected';
          }
        }
      });
    }
  }

  customElements.define(LiveSplitStatus.is, LiveSplitStatus);
})();
