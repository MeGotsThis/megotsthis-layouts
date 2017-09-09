(function() {
  'use strict';

  class Mgt480x1080Section extends Polymer.Element {
    static get is() {
      return 'mgt-480-1080-section';
    }

    static get properties() {
      return {
        maxTextSize: {
          type: Number,
          value: 68,
        },
        webcam: {
          type: Boolean,
          value: null,
          reflectToAttribute: true,
          observer: 'webcamChanged',
        },
      };
    }

    ready() {
      super.ready();
      this.visibleSplits = 10;
      this.numStartSplits = 0;
      this.numLastSplits = 1;
      this.lookAhead = 1;
      this.column1Type = 'DeltaOrSplitTime';
      this.column2Type = '';
    }

    webcamChanged(value) {
      if (value) {
        this.visibleSplits = 6;
        this.numStartSplits = 0;
        this.numLastSplits = 1;
        this.lookAhead = 0;
      } else {
        this.visibleSplits = 10;
        this.numStartSplits = 0;
        this.numLastSplits = 1;
        this.lookAhead = 1;
      }
      resetFlex(this.$.splits);
    }
  }

  customElements.define(Mgt480x1080Section.is, Mgt480x1080Section);
})();
