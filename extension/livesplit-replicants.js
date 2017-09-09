'use strict';

const nodecg = require('./util/nodecg-api-context').get();

const livesplitConnected = nodecg.Replicant('livesplit-connected', {
  defaultValue: false,
  persistent: false,
});
const livesplit = nodecg.Replicant('livesplit', {
  defaultValue: {},
  persistent: false,
});
const livesplitTimer = nodecg.Replicant('livesplit-timer', {
  defaultValue: {current: {realTime: null, gameTime: null}, attempt: 0},
  persistent: false,
});
