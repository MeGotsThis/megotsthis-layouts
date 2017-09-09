'use strict';
/* eslint new-cap: ["error", {
  "capIsNewExceptionPattern": "^vmR\..",
  "capIsNewExceptions": [
    "nodecg.Replicant",
    "ffi.Library",
  ]
}]*/

const ffi = require('ffi');
const ref = require('ref');
const path = require('path');
const wchar = require('ref-wchar');

// Ours
const nodecg = require('./util/nodecg-api-context').get();

const floatPtr = ref.refType('float');
const stringPtr = ref.refType('char');

const FREQUENCY = 100;
const GAIN_THREADHOLD = -40.0; // -40.0 dB on the Fader Gain

const gameAudioChannels = nodecg.Replicant('gameAudioChannels');

// Hard code the path instead of using the Windows Registry
let voicemeeterInstallPath = nodecg.bundleConfig.voicemeeter.installPath ||
    'C:/Program Files (x86)/VB/Voicemeeter';
let dllPath;
if (process.arch == 'x64') {
  dllPath = voicemeeterInstallPath + '/VoicemeeterRemote64';
} else {
  dllPath = voicemeeterInstallPath + '/VoicemeeterRemote';
}
const vmR = ffi.Library(dllPath, {
  'VBVMR_Login': ['int', []],
  'VBVMR_Logout': ['int', []],
  'VBVMR_RunVoicemeeter': ['int', ['int']],
  'VBVMR_GetVoicemeeterType': ['int', []],
  'VBVMR_GetVoicemeeterVersion': ['int', []],
  'VBVMR_IsParametersDirty': ['int', []],
  'VBVMR_GetLevel': ['int', ['int', 'int', floatPtr]],
  'VBVMR_GetParameterFloat': ['int', ['string', floatPtr]],
  'VBVMR_SetParameterFloat': ['int', ['string', 'float']],
  'VBVMR_GetParameterStringA': ['int', ['string', 'string']],
  'VBVMR_SetParameterStringA': ['int', ['string', 'string']],
  'VBVMR_GetParameterStringW': ['int', ['string', wchar.string]],
  'VBVMR_SetParameterStringW': ['int', ['string', wchar.string]],
  'VBVMR_SetParameters': ['int', ['string', 'string']],
  'VBVMR_SetParametersW': ['int', ['string', wchar.string]],
});


vmR.VBVMR_Login();
checkVoicemeeter();

setInterval(checkVoicemeeter, FREQUENCY);


function checkVoicemeeter() {
  if (vmR.VBVMR_IsParametersDirty() > 0) {
    let outValue = ref.alloc('float');
    nodecg.bundleConfig.voicemeeter.gameAudioChannels.forEach((item, i) => {
      if (item.fader) {
        vmR.VBVMR_GetParameterFloat(item.fader, outValue);
        let value = outValue.deref();
        let isLow = value < GAIN_THREADHOLD;
        gameAudioChannels.value[i].fadedBelowThreshold = isLow;
      }
      if (item.mute) {
        vmR.VBVMR_GetParameterFloat(item.mute, outValue);
        let value = outValue.deref();
        gameAudioChannels.value[i].muted = !!value;
      }
    });
  }
}

process.on('exit', () => {
  vmR.VBVMR_Logout();
});
