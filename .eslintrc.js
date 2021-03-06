module.exports = {
  "extends": ["eslint:recommended", "google"],
  "plugins": [
    "html"
  ],
  "settings": {
      "html/indent": "+4"
  },
  "rules": {
    "require-jsdoc": 0,
    "no-unused-vars": 0,
    "new-cap": [2, {
      "capIsNewExceptions": [
        "Polymer",
        "nodecg.Replicant",
      ]
    }],
  },
};
