(function() {
  'use strict';

  const loadPresets = document.getElementById('loadPresets');
  const gamesPresets = nodecg.Replicant('gamesPresets');

  gamesPresets.on('change', (value) => {
    loadPresets.presets = Object.keys(value);
  });
  document.addEventListener('dialog-confirmed', () => {
    if (loadPresets.$.preset.value) {
      nodecg.sendMessage('loadGamePreset', loadPresets.$.preset.value);
    }
  });
})();
