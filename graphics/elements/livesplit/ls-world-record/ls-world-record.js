(function() {
  'use strict';

  const livesplit = nodecg.Replicant('livesplit');

  class LiveSplitWorldRecord extends Polymer.Element {
    static get is() {
      return 'ls-world-record';
    }

    static get properties() {
      return {
        filterRegion: {
          type: Boolean,
          value: false,
        },
        filterPlatform: {
          type: Boolean,
          value: false,
        },
        filterVariables: {
          type: Boolean,
          value: false,
        },
        unknownText: {
          type: String,
          value: 'Unknown World Record',
        },
        record: {
          type: String,
          value: '',
          readOnly: true,
          notify: true,
        },
      };
    }

    static get observers() {
      return [
        '_updateRecord(_liveSplit, unknownText, filterRegion, ' +
            'filterPlatform, filterVariables)',
      ];
    }

    ready() {
      super.ready();
      this._liveSplit = null;
      livesplit.on('change', this.livesplitChanged.bind(this));
    }

    livesplitChanged(value) {
      if (!('run' in value)) {
        return;
      }
      this._liveSplit = new LiveSplit(value);
    }

    _updateRecord(
        _liveSplit, unknownText, filterRegion, filterPlatform,
        filterVariables) {
      if (!_liveSplit || this._loading) {
        return;
      }

      const {gameId, categoryId, regionId, platformId,
          variables} = _liveSplit.run.metadata;
      if (gameId == null || categoryId == null) {
        this._setRecord(unknownText);
      } else {
        this._setRecord('Loading World Record');
        this._loading = true;
        let params = {
          game: gameId,
          category: categoryId,
          region: filterRegion ? regionId : null,
          platform: filterRegion ? platformId : null,
          variables: filterVariables ? variables : {},
        };
        nodecg.sendMessage('livesplit-world-record', params)
          .then(function(record) {
            let time = formatMilliseconds(record.time, {
              showMinutes: true,
            }).join('');
            if (record.tie == 0) {
              this._setRecord(`No World Record exists`);
            } else if (record.tie == 1) {
              let runners = record.runners.join(', ');
              this._setRecord(`World Record: ${time} by ${runners}`);
            } else {
              this._setRecord(`World Record: ${time} (${record.tie}-way tie)`);
            }
            this._loading = false;
          }.bind(this))
          .catch((err) => {
            this._setRecord('Error Loading World Record');
            this._loading = false;
          });
      }
    }
  }

  customElements.define(LiveSplitWorldRecord.is, LiveSplitWorldRecord);
})();
