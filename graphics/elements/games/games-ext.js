const TYPE_GAME = 'game';
const TYPE_RUNNER = 'runner';
const TYPE_CATEGORY = 'category';

function validateType(type, fallback) {
  if ([TYPE_GAME, TYPE_RUNNER, TYPE_CATEGORY].includes(type)) {
    return type;
  }
  if (typeof fallback != 'undefined') {
    return fallback;
  }
  return TYPE_GAME;
}
