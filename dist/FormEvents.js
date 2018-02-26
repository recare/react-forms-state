"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VALIDATION_FAILED_EVENT_TYPE = exports.SUBMIT_EVENT_TYPE = exports.INITIAL_CHANGE_EVENT_TYPE = exports.VALUE_CHANGE_EVENT_TYPE = undefined;
exports.createValueChangeEvent = createValueChangeEvent;
exports.createInitialChangeEvent = createInitialChangeEvent;
exports.createSubmitChangeEvent = createSubmitChangeEvent;
exports.createValidationFailedEvent = createValidationFailedEvent;

var _ValidationHelpers = require("./ValidationHelpers");

var VALUE_CHANGE_EVENT_TYPE = exports.VALUE_CHANGE_EVENT_TYPE = "VALUE_CHANGE";var INITIAL_CHANGE_EVENT_TYPE = exports.INITIAL_CHANGE_EVENT_TYPE = "INITIAL_CHANGE";
var SUBMIT_EVENT_TYPE = exports.SUBMIT_EVENT_TYPE = "SUBMIT";
var VALIDATION_FAILED_EVENT_TYPE = exports.VALIDATION_FAILED_EVENT_TYPE = "VALIDATION_FAILED";

function createValueChangeEvent(newValue, statePath, validation) {
  return {
    type: VALUE_CHANGE_EVENT_TYPE,
    newValue: newValue,
    statePath: statePath,
    validation: validation
  };
}

function createInitialChangeEvent(newInitial) {
  return {
    type: INITIAL_CHANGE_EVENT_TYPE,
    newValue: newInitial
  };
}

function createSubmitChangeEvent() {
  return {
    type: SUBMIT_EVENT_TYPE
  };
}

function createValidationFailedEvent(validation) {
  return {
    type: VALIDATION_FAILED_EVENT_TYPE,
    validation: validation
  };
}