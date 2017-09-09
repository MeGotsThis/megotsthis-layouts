(function() {
  'use strict';

  const breakText = nodecg.Replicant('breakText');
  const breatkTextShow = nodecg.Replicant('breatkTextShow');

  class MgtBreak extends Polymer.Element {
    static get is() {
      return 'mgt-break';
    }

    static get properties() {
      return {};
    }

    ready() {
      super.ready();

      this.text = true;
      breakText.on('change', (value) => {
        this.text = value;
      });

      this.hidden = true;
      breatkTextShow.on('change', (value) => {
        this.hidden = !value;
      });
    }
  }

  customElements.define(MgtBreak.is, MgtBreak);
})();
