(function() {
  'use strict';

  const forcedIndex = nodecg.Replicant('ad-force-index');

  class MgtAdvertisement extends Polymer.Element {
    static get is() {
      return 'mgt-advertisement';
    }

    static get properties() {
      return {
        breakText: String,
      };
    }

    ready() {
      super.ready();
      this.$.update.addEventListener('click', this.setForcedIndex.bind(this));
      forcedIndex.on('change', (value) => {
        this.forcedIndex = value;
      });
    }

    setForcedIndex() {
      let value = parseInt(this.forcedIndex);
      forcedIndex.value = !isNaN(value) ? value : null;
    }
  }

  customElements.define(MgtAdvertisement.is, MgtAdvertisement);
})();
