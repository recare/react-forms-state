"use strict";
"use babel";

// $FlowFixMe

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.getJavascriptEntity = getJavascriptEntity;
exports.getImmutableEntity = getImmutableEntity;
exports.getValue = getValue;
exports.setValue = setValue;

var _immutable = require("immutable");

var _StatePathHelpers = require("./StatePathHelpers");

function getJavascriptEntity(obj) {
  if (obj && (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj.toJS) {
    return obj.toJS();
  } else {
    return obj;
  }
}

function getImmutableEntity(obj) {
  if (obj && (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj.toJS) {
    return obj;
  } else if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object") {
    return (0, _immutable.fromJS)(obj);
  } else {
    return obj;
  }
}

function getValue(state, path) {
  if (path === "") {
    return getJavascriptEntity(state);
  } else {
    if ((typeof state === "undefined" ? "undefined" : _typeof(state)) === "object") {
      var valuePath = (0, _StatePathHelpers.getImmutPath)(path);
      return valuePath.reduce(function (red, value) {
        if (red !== undefined && red !== null) {
          // $FlowFixMe
          return red[value];
        } else {
          return red;
        }
      }, state);
    } else {
      return state;
    }
  }
}

function setValue(state, path, value) {
  if (path === "") {
    return value;
  } else {
    var immutState = (0, _immutable.fromJS)(state);
    if (global.process && global.process.env && global.process.env.FORMALIZR_ENV === "DEBUG") console.log(state, path, value, immutState);
    return immutState ? immutState.setIn((0, _StatePathHelpers.getImmutPath)(path), value).toJS() : immutState;
  }
}