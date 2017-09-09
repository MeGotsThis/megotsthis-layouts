'use strict';

const nodecg = require('./util/nodecg-api-context').get();

const webcam = nodecg.Replicant('webcam', {defaultValue: false});

webcam.on('change', (value) => {
  if (value) {
    nodecg.log.info('Showing Webcam');
  } else {
    nodecg.log.info('Hiding Webcam');
  }
});
