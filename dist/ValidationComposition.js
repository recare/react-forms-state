"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeValidation = composeValidation;
exports.notNull = notNull;
exports.notUndefined = notUndefined;
exports.notEmpty = notEmpty;
exports.required = required;
exports.isTrue = isTrue;
exports.maxLength = maxLength;
exports.lessThan = lessThan;

var _immutable = require("immutable");

function composeValidation() {
  for (var _len = arguments.length, validates = Array(_len), _key = 0; _key < _len; _key++) {
    validates[_key] = arguments[_key];
  }

  return function validateValue(value, props) {
    return validates.reduce(function (red, validate) {
      if (red !== true) return red;
      var validated = validate(value, props);
      if (validated === true) return true;else return validated;
    }, true);
  };
}

// $FlowFixMe
function notNull() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$errorString = _ref.errorString,
      errorString = _ref$errorString === undefined ? "Not filled" : _ref$errorString;

  return function validateNotNull(value) {
    if (value === null) {
      return errorString;
    } else {
      return true;
    }
  };
}

function notUndefined() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref2$errorString = _ref2.errorString,
      errorString = _ref2$errorString === undefined ? "Not filled" : _ref2$errorString;

  return function validateNotUndefined(value) {
    if (value === undefined) {
      return errorString;
    } else {
      return true;
    }
  };
}

function notEmpty() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref3$errorString = _ref3.errorString,
      errorString = _ref3$errorString === undefined ? "Not filled" : _ref3$errorString;

  return function validateNotEmpty(value) {
    if (value === "") {
      return errorString;
    } else {
      return true;
    }
  };
}

function required() {
  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref4$errorString = _ref4.errorString,
      errorString = _ref4$errorString === undefined ? "Not filled" : _ref4$errorString;

  return composeValidation(notUndefined({ errorString: errorString }), notNull({ errorString: errorString }), notEmpty({ errorString: errorString }));
}

function isTrue() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref5$errorString = _ref5.errorString,
      errorString = _ref5$errorString === undefined ? "not true" : _ref5$errorString;

  return function validateTrue(value) {
    if (value !== true) {
      return errorString;
    } else {
      return true;
    }
  };
}

function maxLength(max) {
  var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref6$errorString = _ref6.errorString,
      errorString = _ref6$errorString === undefined ? "too long" : _ref6$errorString;

  return function validateMaxLength(value) {
    if (typeof value !== "string" || value.length > max) {
      return errorString;
    } else {
      return true;
    }
  };
}

function lessThan(accessor1, accessor2) {
  var _ref7 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    error: "Invalid"
  },
      error = _ref7.error;

  return function validateLessThan(value, props) {
    if (typeof accessor1 !== "function" && typeof accessor1 !== "string" || typeof accessor2 !== "function" && typeof accessor2 !== "string") throw new Error("lessThan validator takes either a function or a stringPath as accessor type");
    var value1 = typeof accessor1 === "function" ? accessor1(value, props) : (0, _immutable.fromJS)(value).getIn(accessor1.split("."));
    var value2 = typeof accessor2 === "function" ? accessor2(value, props) : (0, _immutable.fromJS)(value).getIn(accessor2.split("."));

    if (typeof value1 === "number" && typeof value2 === "number") {
      if (value1 > value2) {
        if (typeof error === "function") return error(value, props);else return error;
      } else {
        return true;
      }
    } else if (typeof value1 === "string" && typeof value2 === "string") {
      if (value1 > value2) {
        if (typeof error === "function") return error(value, props);else return error;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };
}