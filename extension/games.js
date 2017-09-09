'use strict';

const nodecg = require('./util/nodecg-api-context').get();

const games = nodecg.Replicant('games', {
  defaultValue: [
    {
      runner: null,
      game: null,
      category: null,
      color: null,
    },
    {
      runner: null,
      game: null,
      category: null,
      color: null,
    },
    {
      runner: null,
      game: null,
      category: null,
      color: null,
    },
    {
      runner: null,
      game: null,
      category: null,
      color: null,
    },
  ],
});

const gamesPresets = nodecg.Replicant('gamesPresets', {
  defaultValue: {
    '<empty>': [
      {
        runner: null,
        game: null,
        category: null,
        color: null,
      },
      {
        runner: null,
        game: null,
        category: null,
        color: null,
      },
      {
        runner: null,
        game: null,
        category: null,
        color: null,
      },
      {
        runner: null,
        game: null,
        category: null,
        color: null,
      },
    ],
  },
});

nodecg.listenFor('saveGamePreset', (name) => {
  if (name == '<empty>') {
    return;
  }
  gamesPresets.value[name] = JSON.parse(JSON.stringify(games.value));
});

nodecg.listenFor('loadGamePreset', (name) => {
  if (!(name in gamesPresets.value)) {
    return;
  }
  games.value = JSON.parse(JSON.stringify(gamesPresets.value[name]));
});
