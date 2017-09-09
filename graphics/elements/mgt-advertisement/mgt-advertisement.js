(function() {
  'use strict';

  const donationGoal = nodecg.Replicant('ad-streamlab-donation-goal');
  const forcedIndex = nodecg.Replicant('ad-force-index');

  class MgtAdvertisement extends Polymer.Element {
    static get is() {
      return 'mgt-advertisement';
    }

    static get properties() {
      return {
        forceIndex: {
          type: Number,
        },
      };
    }

    ready() {
      super.ready();

      this.showDonationGoal = true;
      donationGoal.on('change', (value) => {
        this.showDonationGoal = value;
      });

      this.forceIndex = null;
      forcedIndex.on('change', (value) => {
        this.forceIndex = value;
      });
    }
  }

  customElements.define(MgtAdvertisement.is, MgtAdvertisement);
})();
