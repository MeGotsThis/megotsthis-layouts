(function() {
  'use strict';

  const breakText = nodecg.Replicant('breakText');

  class MgtBreakText extends Polymer.Element {
    static get is() {
      return 'mgt-breaktext';
    }

    static get properties() {
      return {
        breakText: String,
      };
    }

    ready() {
      super.ready();
      this.$.update.addEventListener('click', this.setBreakText.bind(this));
      breakText.on('change', (value) => {
        this.breakText = value;
        this.currentBreakText = value || '<blank>';
      });
    }

    setBreakText() {
      breakText.value = this.breakText;
    }
  }

  customElements.define(MgtBreakText.is, MgtBreakText);
})();
