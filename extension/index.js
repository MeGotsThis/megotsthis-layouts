'use strict';

const nodecgApiContext = require('./util/nodecg-api-context');

module.exports = function(nodecg) {
  nodecgApiContext.set(nodecg);

  require('./advertisement');
  require('./breaktext');
  require('./games');
  require('./webcam');
  require('./countdown');

  require('./livesplit-replicants');
  if (nodecg.bundleConfig.livesplit && nodecg.bundleConfig.livesplit.host) {
    require('./livesplit');
  } else {
    nodecg.log.warn('"livesplit" is not defined in cfg! ' +
        'Livesplit integration will be disabled.');
  }

  require('./google-play-music-desktop-replicants');
  if (nodecg.bundleConfig.googlePlayMusic) {
    require('./google-play-music-desktop');
  } else {
    nodecg.log.warn('"googlePlayMusic" is not defined in cfg! ' +
        'Google Play Music Desktop Player integration will be disabled.');
  }

  require('./voicemeeter-replicants');
  if (nodecg.bundleConfig.voicemeeter) {
    require('./voicemeeter');
  } else {
    nodecg.log.warn('"voicemeeter" is not defined in cfg! ' +
        'Voicemeeter integration will be disabled.');
  }
};
