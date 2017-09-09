'use strict';

const nodecg = require('./util/nodecg-api-context').get();

const donationGoal = nodecg.Replicant('ad-streamlab-donation-goal', {
  defaultValue: true,
});
const forcedIndex = nodecg.Replicant('ad-force-index', {
  defaultValue: null,
});

donationGoal.on('change', (value) => {
  if (value) {
    nodecg.log.info('Showing Donation Goal');
  } else {
    nodecg.log.info('Hiding Donation Goal');
  }
});
