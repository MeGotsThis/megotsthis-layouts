(function() {
  'use strict';

  const FADE_DURATION = 0.66;
  const FADE_OUT_EASE = Power1.easeIn;
  const FADE_IN_EASE = Power1.easeOut;
  const HOLD_DURATION = 20;

  class MgtCycler extends Polymer.Element {
    static get is() {
      return 'mgt-cycler';
    }

    static get properties() {
      return {
        duration: {
          type: Number,
          value: HOLD_DURATION,
        },
        globalTime: {
          type: Boolean,
        },
        forceIndex: {
          type: Number,
        },
      };
    }

    ready() {
      super.ready();
      this.initializeContent.apply(this);
    }

    initializeContent() {
      this.nodes = this.nodes ||
          Polymer.FlattenedNodesObserver.getFlattenedNodes(this)
            .filter((n) => n.nodeType === Node.ELEMENT_NODE);
      this.start = Date.now();
      this.currentIndex = -1;
      if (this.nodes.length > 0) {
        setInterval(this.nextContent.bind(this), 100);
        this.nextContent.apply(this);
      }
    }

    nextContent() {
      if (this._transitioning) {
        return;
      }
      if (!this.nodes || this.nodes.length <= 0) {
        return;
      }

      let validNodes = [];
      for (let i = 0; i < this.nodes.length; i++) {
        if (!this.nodes[i].hidden) {
          validNodes.push(this.nodes[i]);
        }
      }
      if (validNodes.length <= 0) {
        return;
      }
      let nextIdx;
      if (typeof this.forceIndex != 'number' || this.forceIndex < 0 ||
          this.forceIndex >= validNodes.length) {
        let delta = Date.now() - (this.globalTime ? 0 : this.start);
        nextIdx = (~~(delta / this.duration / 1000)) % validNodes.length;
      } else {
        nextIdx = this.forceIndex;
      }
      let nextNode = validNodes[nextIdx];

      // Create one-time animation to fade from current to next.
      const tl = new TimelineLite();

      if (nextNode == this.currentContent) {
        this.currentIndex = nextIdx;
      } else {
        if (this.currentContent) {
          this._transitioning = true;
          tl.to(this.$.content, FADE_DURATION, {
            opacity: 0,
            ease: FADE_OUT_EASE,
            onComplete: function() {
              Polymer.dom(this.$.content).removeChild(this.currentContent);
              Polymer.dom(this.$.content).appendChild(nextNode);
              this.currentContent = nextNode;
              this.currentIndex = nextIdx;
              this._transitioning = false;
            }.bind(this),
          });
        } else {
          this.currentContent = nextNode;
          this.currentIndex = nextIdx;
          Polymer.dom(this.$.content).appendChild(this.currentContent);
        }

        tl.to(this.$.content, FADE_DURATION, {
          opacity: 1,
          ease: FADE_IN_EASE,
        }, 'start');
      }
    }
  }

  customElements.define(MgtCycler.is, MgtCycler);
})();
