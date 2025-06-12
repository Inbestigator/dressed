"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./mjs/react-reconciler.production.cjs");
} else {
  module.exports = require("./mjs/react-reconciler.development.cjs");
}
