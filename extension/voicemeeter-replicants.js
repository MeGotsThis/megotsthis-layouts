'use strict';

const clone = require('clone');

const nodecg = require('./util/nodecg-api-context').get();

const DEFAULT_CHANNEL_OBJ = {
  muted: true,
  fadedBelowThreshold: true,
};

const gameAudioChannels = nodecg.Replicant('gameAudioChannels', {
  defaultValue: [
    clone(DEFAULT_CHANNEL_OBJ),
    clone(DEFAULT_CHANNEL_OBJ),
    clone(DEFAULT_CHANNEL_OBJ),
    clone(DEFAULT_CHANNEL_OBJ),
  ],
  persistent: false,
});
