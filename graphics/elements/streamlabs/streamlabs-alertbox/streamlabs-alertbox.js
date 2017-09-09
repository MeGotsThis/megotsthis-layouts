(function() {
  'use strict';

  class StreamLabsAlertBox extends Polymer.Element {
    static get is() {
      return 'streamlabs-alertbox';
    }

    static get properties() {
      return {};
    }

    ready() {
      super.ready();
      let token = nodecg.bundleConfig.streamLabs.apiAccessToken;
      if (token) {
        this.url = 'https://streamlabs.com/alert-box/v3/' + token;
      } else {
        this.url = undefined;
      }
    }
  }

  customElements.define(StreamLabsAlertBox.is, StreamLabsAlertBox);
})();
