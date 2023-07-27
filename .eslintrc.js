module.exports = {
  root: true,
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    parser: "babel-eslint",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ["plugin:react-hooks/recommended", "prettier"],
  rules: {
    "no-restricted-globals": 0,
    "no-unused-expressions": 0,
    "no-undef": 0,
  },
};
