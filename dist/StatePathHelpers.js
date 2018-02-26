"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.getImmutPath = getImmutPath;
exports.getNewPath = getNewPath;

var _StateValueHelpers = require("./StateValueHelpers");

function getImmutPath(path) {
  if (path === "") return [];
  return path.split(".").map(function (p) {
    return isNaN(p) ? p : parseInt(p);
  });
}

function getNewPath(immutState, statePath, name) {
  var value = (0, _StateValueHelpers.getValue)(immutState, statePath);
  if (Array.isArray(value)) {
    var index = value.findIndex(function (obj) {
      return obj && (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj.id === name;
    });
    return "" + statePath + (statePath.length > 0 ? "." : "") + index + ".value";
  } else {
    return "" + statePath + (statePath.length > 0 ? "." : "") + name;
  }
}