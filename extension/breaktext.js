'use strict';

const nodecg = require('./util/nodecg-api-context').get();

const breakText = nodecg.Replicant('breakText', {defaultValue: ''});
const breatkTextShow = nodecg.Replicant('breatkTextShow', {
  defaultValue: false,
});

breatkTextShow.on('change', (value) => {
  if (value) {
    nodecg.log.info('Showing Break Text');
  } else {
    nodecg.log.info('Hiding Break Text');
  }
});

breakText.on('change', () => {
  nodecg.log.info('Break Text changed');
});
