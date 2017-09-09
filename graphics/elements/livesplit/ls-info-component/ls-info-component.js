class LiveSplitInfoComponent extends Polymer.Element {
  static get is() {
    return 'ls-info-component';
  }

  static get properties() {
    return {
      text: {
        type: String,
        value: null,
      },
      value: {
        type: String,
        value: null,
      },
    };
  }
}
