(function() {
  'use strict';

  class StreamLabsDonationGoal extends Polymer.Element {
    static get is() {
      return 'streamlabs-donationgoal';
    }

    static get properties() {
      return {};
    }

    ready() {
      super.ready();
      let token = nodecg.bundleConfig.streamLabs.apiAccessToken;
      if (token) {
        this.url = 'https://streamlabs.com/widgets/donation-goal?token=' +
         token;
      } else {
        this.url = undefined;
      }
    }
  }

  customElements.define(StreamLabsDonationGoal.is, StreamLabsDonationGoal);
})();
