require("babel-register")({
    presets: ["env"],
});
require("babel-core/register");

// Import the rest of our application.

const { setUpCombinedReducers } = require("./reducers");
const { dispatchActions } = require("./actions/action.creator");

module.exports = {
    dispatchActions,
    setUpCombinedReducers,
};