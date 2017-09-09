let albumHideArtist = [
  'Pokémon Ruby & Pokémon Sapphire: Super Music Collection',
  'Pokémon FireRed & Pokémon LeafGreen: Super Music Collection',
  'Pokémon Diamond & Pokémon Pearl: Super Music Collection',
  'Pokémon HeartGold & Pokémon SoulSilver: Super Music Collection',
  'Pokémon Black & Pokémon White: Super Music Collection',
  'Pokémon Black 2 & Pokémon White 2: Super Music Collection',
  'Pokémon X & Pokémon Y: Super Music Collection',
  'Pokémon Omega Ruby & Pokémon Alpha Sapphire: Super Music Collection',
  'Pokémon Sun & Pokémon Moon: Super Music Collection',

  'Super Mario Galaxy: Original Soundtrack Platinum Version',
  'Super Mario Galaxy 2: Original Sound Track',

  'Mario Kart 64 Race Tracks',
  'Super Mario 64 Original Soundtrack',
  'Super Mario Kart OST',
  'Super Mario RPG Original Sound Version',
  'Super Mario World',

  `The Legend of Zelda: Majora's Mask`,
  'The Legend of Zelda The Wind Waker HD Sound Selection',
  'The Legend of Zelda: Twilight Princess HD Sound Selection',
  'The Legend of Zelda 25th Anniversary Special Orchestra',
  'The Legend of Zelda: Breath of the Wild',
];


function hideArtist(title, artist, album) {
  if (title == null || artist == null || album == null) {
    return false;
  }
  if (albumHideArtist.includes(album)) {
    return true;
  }
  return false;
}


function hideAlbum(title, artist, album) {
  if (title == null || artist == null || album == null) {
    return false;
  }
  if (hideArtist(title, artist, album)) {
    return false;
  }
  if (title.length + artist.length + album.length >= 70) {
    return true;
  }
  return false;
}


function resetFlex(element) {
  Polymer.RenderStatus.afterNextRender(element, () => {
    element.style.display = 'none';
    Polymer.RenderStatus.afterNextRender(element, () => {
      element.style.display = null;
    });
  });
}
