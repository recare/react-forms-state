"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = StateDispatcher;

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _immutable = require("immutable");

var _FormElement = require("./FormElement");

var _FormElement2 = _interopRequireDefault(_FormElement);

var _StateValueHelpers = require("./StateValueHelpers");

var _Rx = require("rxjs/Rx");

var _Rx2 = _interopRequireDefault(_Rx);

var _FormEvents = require("./FormEvents");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// $FlowFixMe


function StateDispatcher() {
  var convertIn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (v, props) {
    return v;
  };
  var convertOut = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (v, props) {
    return v;
  };

  return function (WrappedComponent) {
    var Dispatcher = function (_React$Component) {
      _inherits(Dispatcher, _React$Component);

      function Dispatcher(props) {
        _classCallCheck(this, Dispatcher);

        var _this = _possibleConstructorReturn(this, (Dispatcher.__proto__ || Object.getPrototypeOf(Dispatcher)).call(this, props));

        _this.handlers = {};
        _this.valueChangeObs = props.valueChangeObs.map(function (e) {
          var convertedValue = convertIn(e.value, props);
          if (convertedValue === e.value) return e;else return Object.assign({}, e, {
            value: convertedValue,
            validation: e.validation,
            statePath: e.type === _FormEvents.INITIAL_CHANGE_EVENT_TYPE ? undefined : props.statePath
          });
        });
        return _this;
      }

      _createClass(Dispatcher, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          var _this2 = this;

          if (this.context.attachToForm != null) this.context.attachToForm(function () {
            return _this2.getUncontrolledState();
          });
          this.subscription = this.valueChangeObs.filter(function (e) {
            return e.type === _FormEvents.INITIAL_CHANGE_EVENT_TYPE;
          }).do(function (e) {
            if (global.process && global.process.env && global.process.env.FORMALIZR_ENV === "DEBUG") {
              console.log("Dispatching uncontrolled values from " + _this2.props.statePath);
            }
          }).subscribe({
            next: function next(e) {
              return _this2.dispatchUncontrolledValues(e);
            }
          });
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this.context.attachToForm != null) this.context.attachToForm(null);
          this.subscription.unsubscribe();
        }
      }, {
        key: "dispatchUncontrolledValues",
        value: function dispatchUncontrolledValues(event) {
          var _this3 = this;

          Object.keys(this.handlers).forEach(function (statePath) {
            if (event.oldValue === undefined || (0, _StateValueHelpers.getValue)(convertIn(event.value, _this3.props), statePath) !== (0, _StateValueHelpers.getValue)(convertIn(event.oldValue, _this3.props), statePath)) _this3.handlers[statePath].set((0, _StateValueHelpers.getValue)(convertIn(event.value, _this3.props), statePath));
          });
        }
      }, {
        key: "getChildContext",
        value: function getChildContext() {
          var _this4 = this;

          return {
            valueChangeObs: this.valueChangeObs,
            rootValueChangeObs: this.props.rootValueChangeObs,
            onStateChange: function onStateChange(v, statePath, validation) {
              var convertedInParentValue = convertIn(_this4.props.getValue(), _this4.props);
              var completeValue = Array.isArray(convertedInParentValue) === false ? Object.assign({}, convertedInParentValue, _defineProperty({}, statePath, v)) : (0, _immutable.List)().concat(convertedInParentValue).update(function (list) {
                return list.update(list.findIndex(function (item) {
                  return item.id === statePath;
                }), function (item) {
                  return Object.assign({}, item, { value: v });
                });
              });
              var convertedValue = convertOut(completeValue, _this4.props);
              // console.log(
              //   "On change",
              //   completeValue,
              //   convertedValue,
              //   completeValue !== convertedValue,
              //   v,
              //   statePath,
              // );
              if (convertedValue !== completeValue || (typeof convertedValue === "undefined" ? "undefined" : _typeof(convertedValue)) !== _typeof(_this4.props.getValue())) _this4.props.onChange(convertedValue, _this4.props.statePath, validation);else _this4.props.onChange(v, "" + _this4.props.statePath + (_this4.props.statePath === "" || statePath === "" ? "" : ".") + statePath, validation);
            },
            attachToForm: null,
            addHandler: function (statePath, getHandler, setHandler) {
              _this4.handlers = Object.assign({}, _this4.handlers, _defineProperty({}, statePath, {
                get: getHandler,
                set: setHandler
              }));
            }.bind(this)
          };
        }

        // Can probably go

      }, {
        key: "getUncontrolledState",
        value: function getUncontrolledState() {
          var _this5 = this;

          var value = Object.keys(this.handlers).reduce(function (red, statePath) {
            return (0, _StateValueHelpers.setValue)(red, statePath, _this5.handlers[statePath].get());
          }, {});
          return convertOut(value, this.props);
        }
      }, {
        key: "render",
        value: function render() {
          return React.createElement(WrappedComponent, this.props);
        }
      }]);

      return Dispatcher;
    }(React.Component);

    // $FlowFixMe


    Dispatcher.defaultProps = Object.assign({}, WrappedComponent.defaultProps, {
      onChange: function onChange() {},

      value: {},
      valueChangeObs: _Rx2.default.Observable.never()
    });

    Dispatcher.propTypes = {
      valueChangeObs: _propTypes2.default.any,
      onChange: _propTypes2.default.func
    };

    Dispatcher.childContextTypes = {
      valueChangeObs: _propTypes2.default.any,
      onStateChange: _propTypes2.default.func,
      addHandler: _propTypes2.default.func,
      attachToForm: _propTypes2.default.func,
      rootValueChangeObs: _propTypes2.default.any
    };

    Dispatcher.contextTypes = {
      attachToForm: _propTypes2.default.func
    };

    return (0, _FormElement2.default)({
      root: true,
      setUncontrolledValue: function setUncontrolledValue(child) {}
    })(Dispatcher);
  };
}