class GooglePlayMusicDesktopBase extends Polymer.Element {
  static get properties() {
    return {
      hideTitle: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      hideArtist: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      hideAlbum: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },

      connected: {
        type: Boolean,
        value: false,
        computed: 'computeConnected(gmpdConnected)',
      },
      playing: {
        type: Boolean,
        value: false,
        computed: 'computePlaying(gmpd)',
      },
      title: {
        type: String,
        value: null,
        computed: 'computeTitle(gmpd)',
      },
      artist: {
        type: String,
        value: null,
        computed: 'computeArtist(gmpd)',
      },
      album: {
        type: String,
        value: null,
        computed: 'computeAlbum(gmpd)',
      },
      albumArt: {
        type: String,
        value: '',
        computed: 'computeAlbumArt(gmpd)',
      },
    };
  }

  ready() {
    super.ready();
    nodecg.Replicant('gmpd-connected').on('change', (value) => {
      this.gmpdConnected = value;
    });
    nodecg.Replicant('gmpd').on('change', (value) => {
      this.gmpd = Object.assign({}, value);
    });
  }

  computeConnected(gmpdConnected) {
    if (!gmpdConnected) {
      return false;
    }
    return !!gmpdConnected;
  }

  computePlaying(gmpd) {
    if (!gmpd) {
      return false;
    }
    return gmpd.playState;
  }

  computeTitle(gmpd) {
    if (!gmpd) {
      return false;
    }
    return gmpd.track.title;
  }

  computeArtist(gmpd) {
    if (!gmpd) {
      return false;
    }
    return gmpd.track.artist;
  }

  computeAlbum(gmpd) {
    if (!gmpd) {
      return false;
    }
    return gmpd.track.album;
  }

  computeAlbumArt(gmpd) {
    if (!gmpd) {
      return '';
    }
    return gmpd.track.albumArt || '';
  }
}


function formatMusicMilliseconds(time, options={}) {
  let secondsPrecision = options.secondsPrecision || 0;
  let showMinutes = options.showMinutes || false;
  let showHours = options.showHours || false;
  let twoPlaces = options.twoPlaces || false;
  let places;

  let timeStr = '';
  if (time < 0) {
    timeStr = '-';
    time = -time;
  }
  showHours = showHours || time >= 60 * 60 * 1000;
  if (showHours) {
    let hours = (~~(time / (60 * 60 * 1000))) + '';
    time = time % (60 * 60 * 1000);
    places = twoPlaces ? 2 : 1;
    timeStr += rightJustify(hours, places, '0') + ':';
  }
  showMinutes = showMinutes || showHours || time >= 60 * 1000;
  if (showMinutes) {
    let minutes = (~~(time / (60 * 1000))) + '';
    time = time % (60 * 1000);
    places = showHours || twoPlaces ? 2 : 1;
    timeStr += rightJustify(minutes, places, '0') + ':';
  }
  let seconds = (~~(time / 1000)) + '';
  time = time % 1000;
  places = showHours || showMinutes || twoPlaces ? 2 : 1;
  timeStr += rightJustify(seconds, places, '0');
  if (secondsPrecision > 0) {
    timeStr = '.';
    if (secondsPrecision == 1) {
      timeStr += leftJustify(~~(time / 100) + '', 1, '0');
    } else if (secondsPrecision == 2) {
      timeStr += leftJustify(~~(time / 10) + '', 2, '0');
    } else if (secondsPrecision == 3) {
      timeStr += leftJustify(~~time + '', 3, '0');
    }
  }
  return timeStr;
}

function leftJustify(string, width, fill=' ') {
  while (string.length < width) {
    string = string + fill;
  }
  return string;
}

function rightJustify(string, width, fill=' ') {
  while (string.length < width) {
    string = fill + string;
  }
  return string;
}
