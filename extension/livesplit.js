'use strict';

const WebSocket = require('ws');
const request = require('request-promise');

const nodecg = require('./util/nodecg-api-context').get();

const CONNECTION_FREQUENCY = 1000;
const FREQUENCY = 8;

let connection = null;
let dateReceived = null;

let leaderboardCache = {};

const livesplitConnected = nodecg.Replicant('livesplit-connected');
const livesplit = nodecg.Replicant('livesplit');
const livesplitTimer = nodecg.Replicant('livesplit-timer');

livesplitConnected.on('change', (v) => {
  nodecg.log.info('livesplitConnected changed to ' + v);
});

checkLiveSplit();
setInterval(checkLiveSplit, CONNECTION_FREQUENCY);

setInterval(tick, FREQUENCY);


nodecg.listenFor('livesplit-world-record', function(param, callback) {
  let cacheKey = keyLeaderboard(param);
  if (leaderboardCache[cacheKey]) {
    if (leaderboardCache[cacheKey].data) {
      if (leaderboardCache[cacheKey].timestamp + 60 * 60 * 1000 >= Date.now()) {
        callback(undefined, leaderboardCache[cacheKey].data);
        return;
      }
    } else {
      if (leaderboardCache[cacheKey].timestamp + 5 * 60 * 1000 >= Date.now()) {
        callback(leaderboardCache[cacheKey].error);
        return;
      }
    }
  }

  let {game, category, region, platform, variables} = param;
  let url = 'http://www.speedrun.com/api/v1/leaderboards/' + game +
      '/category/' + category;
  let query = {
    top: 1,
    embed: 'players',
  };
  if (region) {
    query.region = region;
  }
  if (platform) {
    query.platform = platform;
  }
  if (variables) {
    for (let varId in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, varId)) {
        query['var-'+varId] = variables[varId];
      }
    }
  }
  request({
    uri: url,
    qs: query,
    json: true,
  }).then(({data}) => {
    let rtnData = {
      time: null,
      runners: [],
      tie: data.runs.length,
    };
    if (data.runs.length) {
      rtnData.time = data.runs[0].run.times.primary_t * 1000;
      rtnData.runners = data.players.data.map((p) => {
        return p.names.international || p.names.japanese;
      });
    }
    leaderboardCache[cacheKey] = {
      timestamp: Date.now(),
      error: null,
      data: rtnData,
    };
    callback(undefined, rtnData);
  }).catch((err) => {
    leaderboardCache[cacheKey] = {
      timestamp: Date.now(),
      error: err,
      data: null,
    };
    callback(err);
  });
});


function keyLeaderboard({game, category, region, platform, variables}) {
  return game + '=' + category + '=' + region + '=' + platform + '=' +
    Object.keys(variables).map(function(key) {
      return key + '=' + variables[key];
    }).join('|');
}


function checkLiveSplit() {
  if (connection) {
    if (connection.readyState == connection.OPEN ||
        connection.readyState == connection.CONNECTING) {
      return;
    }
  }
  let address = nodecg.bundleConfig.livesplit.host;
  let port = nodecg.bundleConfig.livesplit.port || 15721;
  connection = new WebSocket(`ws://${address}:${port}/`);
  connection.on('open', function() {
    livesplitConnected.value = true;
  }).on('message', function(data) {
    dateReceived = Date.now();
    let jsonData = JSON.parse(data);
    livesplit.value = jsonData.state;
    tick();
    send(jsonData);
  }).on('error', function(err) {
    livesplitConnected.value = false;
    connection = null;
  }).on('close', function() {
    livesplitConnected.value = false;
    connection = null;
  });
}


function tick() {
  if (!livesplitConnected.value) {
    return;
  }
  if (!livesplit.value.currentTime) {
    return;
  }
  const lsT = livesplitTimer;
  if (livesplit.value.timerState != 'Running') {
    let attempt = livesplitTimer.value.attempt;
    if (attempt != livesplit.value.currentAttemptDuration) {
      livesplitTimer.value = {
        current: Object.assign({}, livesplit.value.currentTime),
        attempt: livesplit.value.currentAttemptDuration,
      };
    }
    return;
  }
  let diff = Date.now() - dateReceived;
  let realTime = null;
  let gameTime = null;
  if (livesplit.value.currentTime.realTime !== null) {
    realTime = livesplit.value.currentTime.realTime + diff;
  }
  if (livesplit.value.currentTime.gameTime !== null) {
    gameTime = livesplit.value.currentTime.gameTime + diff;
  }
  livesplitTimer.value = {
    current: Object.assign({}, livesplit.value.currentTime, {
      realTime: realTime,
      gameTime: gameTime,
    }),
    attempt: livesplit.value.currentAttemptDuration + diff,
  };
}


function send(data) {
  const liveSplitActions = [
      'split', 'undo-split', 'skip-split', 'start', 'reset', 'pause',
      'undo-all-pauses', 'resume', 'scroll', 'switch-comparison',
      'run-manually-modified', 'comparison-renamed',
    ];
  if (data.action) {
    if (liveSplitActions.includes(data.action.action)) {
      nodecg.sendMessage('livesplit-' + data.action.action, {
        data: data.action.data,
        state: data.state,
        time: livesplitTimer.value,
      });
    }
  }
}
