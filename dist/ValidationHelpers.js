"use strict";
"use babel";

// $FlowFixMe

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Validation = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isValid = isValid;
exports.getErrorText = getErrorText;

var _immutable = require("immutable");

var _StateValueHelpers = require("./StateValueHelpers");

var _StatePathHelpers = require("./StatePathHelpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function isValid(validation) {
  if (typeof validation === "boolean") return validation;else if (validation == null) return true;else if ((typeof validation === "undefined" ? "undefined" : _typeof(validation)) === "object" && _typeof(validation.infos) === "object" && validation.infos !== null && Object.keys(validation.infos).length === 0) return true;else {
    return validation.infos === true || validation.infos == null;
  }
}

function getErrorText(validation) {
  if (typeof validation.infos === "string") return validation.infos;else return null;
}

function _setErrorForFieldAt(infos, statePath, error) {
  if (statePath === "" || infos == null || (typeof infos === "undefined" ? "undefined" : _typeof(infos)) !== "object") {
    return infos;
  } else {
    return (0, _immutable.fromJS)(infos).setIn((0, _StatePathHelpers.getImmutPath)(statePath), error).toJS();
  }
}

function _removeErrorForFieldAt(infos, statePath) {
  return _setErrorForFieldAt(infos, statePath, null);
}

var Validation = exports.Validation = function () {
  function Validation() {
    var infos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Validation);

    this.infos = infos;
  }

  _createClass(Validation, [{
    key: "setErrorForFieldAt",
    value: function setErrorForFieldAt(statePath, error) {
      return new Validation(_setErrorForFieldAt(this.infos, statePath, error));
    }
  }, {
    key: "removeErrorForFieldAt",
    value: function removeErrorForFieldAt(statePath) {
      return new Validation(_removeErrorForFieldAt(this.infos, statePath));
    }
  }, {
    key: "getErrorForFieldAt",
    value: function getErrorForFieldAt(statePath) {
      if (statePath === "") return (0, _StateValueHelpers.getJavascriptEntity)(this.infos);else {
        if (_typeof(this.infos) === "object") {
          var valuePath = (0, _StatePathHelpers.getImmutPath)(statePath);
          return valuePath.reduce(function (red, value) {
            if (red !== undefined && red !== null && (typeof red === "undefined" ? "undefined" : _typeof(red)) === "object") {
              return red[value];
            } else {
              return red;
            }
          }, this.infos);
        } else return null;
      }
    }
  }, {
    key: "getNestedValidation",
    value: function getNestedValidation(statePath) {
      if (statePath === "") {
        return this;
      } else {
        // $FlowFixMe
        return new Validation(this.getErrorForFieldAt(statePath));
      }
    }
  }]);

  return Validation;
}();