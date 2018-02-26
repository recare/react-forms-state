"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _FormEvents = require("./FormEvents");

var _rxjs = require("rxjs");

var _rxjs2 = _interopRequireDefault(_rxjs);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _StateValueHelpers = require("./StateValueHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NeverObservable = _rxjs2.default.Observable.never();

var FormWatcher = function (_React$Component) {
  _inherits(FormWatcher, _React$Component);

  function FormWatcher(props, context) {
    _classCallCheck(this, FormWatcher);

    var _this = _possibleConstructorReturn(this, (FormWatcher.__proto__ || Object.getPrototypeOf(FormWatcher)).call(this, props));

    _this.state = {
      value: null,
      validation: true
    };

    _this.watchPath = _this.getWatchedPath(props, context);
    if (_this.watchPath == null) {
      throw new Error("watchPath props is not set on FormWatcher, you have to set a statepath string on which the FormWatcher will watch");
    }
    _this.selectObs(props, context);
    return _this;
  }

  _createClass(FormWatcher, [{
    key: "getAssignedObs",
    value: function getAssignedObs(props, context) {
      if (context.rootValueChangeObs != null) return context.rootValueChangeObs;else return NeverObservable;
    }
  }, {
    key: "selectObs",
    value: function selectObs(props, context) {
      var _this2 = this;

      this.valueChangeObs = this.getAssignedObs(props, context).filter(function (e) {
        if (props.__debug) {
          console.log("FILTERING", e, "In watcher", _this2.watchPath);
        }
        if (e.statePath) return _this2.watchPath.startsWith(e.statePath) || e.statePath.startsWith(_this2.watchPath);else if (e.type === _FormEvents.INITIAL_CHANGE_EVENT_TYPE) return true;else if (e.type === _FormEvents.VALIDATION_FAILED_EVENT_TYPE) return true;else return false;
      });
    }
  }, {
    key: "connectsToFormController",
    value: function connectsToFormController() {
      var _this3 = this;

      if (this.subscription) this.subscription.unsubscribe();
      this.subscription = this.valueChangeObs.subscribe(function (e) {
        _this3.setState({
          value: e.value,
          validation: e.validation
        });
      });
    }
  }, {
    key: "getWatchedPath",
    value: function getWatchedPath(props, context) {
      return typeof props.watchPath === "function" ? props.watchPath(context.completeStatePath || "") : props.watchPath;
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.connectsToFormController();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps, nextContext) {
      if (this.valueChangeObs !== this.getAssignedObs(nextProps, nextContext)) {
        this.selectObs(nextProps, nextContext);
        this.connectsToFormController();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (typeof this.props.children !== "function") throw new Error("children of FormWatcher must be a function of type (stateValue, props) => React$element");
      var watchedValidation = _typeof(this.state.validation) === "object" && this.state.validation !== null ? this.state.validation.getNestedValidation(this.watchPath) : this.state.validation;
      return this.props.children({
        value: this.state.value,
        watchedValue: (0, _StateValueHelpers.getValue)(this.state.value, this.getWatchedPath(this.props, this.context)),
        watchedStatePath: this.watchPath,
        validation: this.state.validation,
        watchedValidation: watchedValidation
      }, this.props);
    }
  }]);

  return FormWatcher;
}(React.Component);

// $FlowFixMe


exports.default = FormWatcher;
FormWatcher.defaultProps = {
  __debug: false
};

FormWatcher.contextTypes = {
  rootValueChangeObs: _propTypes2.default.any,
  completeStatePath: _propTypes2.default.string
};