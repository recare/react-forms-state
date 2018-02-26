"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = FormElement;

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _StateValueHelpers = require("./StateValueHelpers");

var _FormEvents = require("./FormEvents");

var _Rx = require("rxjs/Rx");

var _Rx2 = _interopRequireDefault(_Rx);

var _ValidationHelpers = require("./ValidationHelpers");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NeverObservable = _Rx2.default.Observable.never();

function FormElement() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$root = _ref.root,
      root = _ref$root === undefined ? false : _ref$root,
      _ref$validate = _ref.validate,
      validate = _ref$validate === undefined ? function () {
    return true;
  } : _ref$validate;

  return function FormElementHOC(WrappedComponent) {
    var FormElementContainer = function (_React$Component) {
      _inherits(FormElementContainer, _React$Component);

      function FormElementContainer(props,
      // $FlowFixMe
      context) {
        _classCallCheck(this, FormElementContainer);

        var _this = _possibleConstructorReturn(this, (FormElementContainer.__proto__ || Object.getPrototypeOf(FormElementContainer)).call(this, props));

        _this.state = {
          value: null
        };
        _this.configureObs(props, context);
        return _this;
      }

      _createClass(FormElementContainer, [{
        key: "getHumanReadableIdentifier",
        value: function getHumanReadableIdentifier(props,
        // $FlowFixMe
        context) {
          var currentStatePath = this.getCurrentStatePath(props, context, {});
          return "ProxiedField with statePath " + (currentStatePath != null && currentStatePath !== "" ? currentStatePath : '""') + " and elementName " + (props.elementName !== "" && props.elementName !== undefined ? props.elementName : '""');
        }
      }, {
        key: "getAssignedObs",
        value: function getAssignedObs(props,
        // $FlowFixMe
        context) {
          if (props.valueChangeObs) {
            return props.valueChangeObs;
          } else if (context.valueChangeObs) {
            return context.valueChangeObs;
          } else {
            return NeverObservable;
          }
        }
      }, {
        key: "configureObs",
        value: function configureObs(props,
        // $FlowFixMe
        context) {
          var _this2 = this;

          this.parentValueChangeObs = this.getAssignedObs(props, context);
          if (this.parentValueChangeObs === NeverObservable && props.__debug) console.warn(this.getHumanReadableIdentifier(props, context) + " hasn't received any valueChangeObs neither as props nor context. Maybe you have forgotten the FormController / StateDispatcher duo");
          this.valueChangeObs = this.parentValueChangeObs.do(function (e) {
            if (props.__debug) {
              var path = _this2.getCompleteCurrentStatePath(props, context, e.value);
              if (path !== "" && e.type === _FormEvents.VALUE_CHANGE_EVENT_TYPE) {
                console.log("FILTERING", path, "FOR STATEPATH", e.statePath, "PROPS", props, "CONTEXT", context);
              }
            }
          }).filter(function (e) {
            var path = _this2.getCompleteCurrentStatePath(props, context, e.value);
            return e.type === _FormEvents.INITIAL_CHANGE_EVENT_TYPE || e.type === _FormEvents.VALIDATION_FAILED_EVENT_TYPE || path.startsWith(e.statePath) || root && e.statePath.startsWith(path);
          }).do(function (e) {
            if (props.__debug) {
              var path = _this2.getCompleteCurrentStatePath(props, context, e.value);
              if (path !== "" && e.type === _FormEvents.VALUE_CHANGE_EVENT_TYPE) {
                console.log("REFRESHING", path, "FOR EVENT", e);
              }
            }
          }).map(function (e) {
            return Object.assign({}, e, {
              value: (0, _StateValueHelpers.getValue)(e.value, _this2.getCurrentStatePath(props, context, e.value)),
              validation: e.validation && e.validation instanceof _ValidationHelpers.Validation ? e.validation.getNestedValidation(_this2.getCurrentStatePath(props, context, e.value)) : e.validation
            });
          }).do(function (e) {
            if (props.__debug) {
              console.log("FOUND VALUE:", e);
            }
          });
        }
      }, {
        key: "connectToFormController",
        value: function connectToFormController(props,
        // $FlowFixMe
        context) {
          var _this3 = this;

          if (this.valueChangeObs) {
            this.disconnectFromFormController();
            this.subscription = this.valueChangeObs.subscribe(function (e) {
              if (props.__debug) {
                console.log("Setting value", e, "in " + (root ? "instance" : "state") + " mode");
              }
              if (e.value === undefined) {
                console.warn(_this3.getHumanReadableIdentifier(props, context) + " doesn't have any value set in the state, it may break");
              }
              if (root) {
                _this3.value = e.value;
                _this3.validation = e.validation;
              } else {
                _this3.setState({
                  value: e.value,
                  validation: e.validation
                });
              }
            });
          }
        }
      }, {
        key: "disconnectFromFormController",
        value: function disconnectFromFormController() {
          if (this.subscription) {
            this.subscription.unsubscribe();
          }
        }
      }, {
        key: "componentDidMount",
        value: function componentDidMount() {
          this.connectToFormController(this.props, this.context);
        }

        // $FlowFixMe

      }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps, nextContext) {
          if (this.parentValueChangeObs !== this.getAssignedObs(nextProps, nextContext)) {
            console.log("Reconnecting " + this.getHumanReadableIdentifier(nextProps, nextContext));
            this.configureObs(nextProps, nextContext);
            this.connectToFormController(nextProps, nextContext);
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.disconnectFromFormController();
        }
      }, {
        key: "getNewPathPart",
        value: function getNewPathPart(props,
        // $FlowFixMe
        context, v) {
          var value = (0, _StateValueHelpers.getValue)(v, context.statePath || "");
          if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && Array.isArray(value)) {
            var index = value.findIndex(function (v) {
              return v.id === props.elementName;
            });
            return (index !== -1 ? index : "") + ".value";
          } else {
            return props.elementName || "";
          }
        }
      }, {
        key: "getNewCompletePathPart",
        value: function getNewCompletePathPart(props,
        // $FlowFixMe
        context, v) {
          var value = (0, _StateValueHelpers.getValue)(v, context.completeStatePath || "");
          if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && Array.isArray(value)) {
            var index = value.findIndex(function (v) {
              return v.id === props.elementName;
            });
            return (index !== -1 ? index : "") + ".value";
          } else {
            return props.elementName || "";
          }
        }
      }, {
        key: "getCurrentStatePath",
        value: function getCurrentStatePath(props,
        // $FlowFixMe
        context, value) {
          if (context.statePath && context.statePath !== "" && props.elementName) return context.statePath + "." + this.getNewPathPart(props, context, value);else if (props.elementName) return this.getNewPathPart(props, context, value);else if (context.statePath) return context.statePath;else return "";
        }
      }, {
        key: "getCompleteCurrentStatePath",
        value: function getCompleteCurrentStatePath(props,
        // $FlowFixMe
        context, value) {
          if (props.valueChangeObs == null && context.completeStatePath && context.completeStatePath !== "" && props.elementName) return context.completeStatePath + "." + this.getNewCompletePathPart(props, context, value);else if (props.elementName) return this.getNewCompletePathPart(props, context, value);else if (props.valueChangeObs == null && context.completeStatePath) return context.completeStatePath;else return "";
        }
      }, {
        key: "getStatePathToDispatch",
        value: function getStatePathToDispatch(props,
        // $FlowFixMe
        context) {
          if (root) return "";else return this.getCurrentStatePath(props, context);
        }
      }, {
        key: "getChildContext",
        value: function getChildContext() {
          return {
            statePath: this.getStatePathToDispatch(this.props, this.context),
            completeStatePath: this.getCompleteCurrentStatePath(this.props, this.context)
          };
        }
      }, {
        key: "getUncontrolledState",
        value: function getUncontrolledState() {
          // $FlowFixMe
          return this.child.getUncontrolledState();
        }
      }, {
        key: "render",
        value: function render() {
          var _this4 = this;

          var value = this.state.value == undefined && this.props.value !== undefined ? this.props.value : this.state.value;
          var validation = this.state.validation == undefined && this.props.validation !== undefined ? this.props.validation : this.state.validation;
          var statePath = this.getCurrentStatePath(this.props, this.context);
          return React.createElement(WrappedComponent, Object.assign({}, this.props, {
            value: value,
            validation: validation,
            valueChangeObs: this.valueChangeObs,
            rootValueChangeObs: this.context.rootValueChangeObs ? this.context.rootValueChangeObs : this.valueChangeObs,
            onChange: this.props.onChange != null ? function (newValue, sp) {
              // $FlowFixMe
              _this4.props.onChange(newValue, sp !== undefined ? sp : statePath, validate(newValue, _this4.props));
            } : function (newValue, sp) {
              _this4.context.onStateChange(newValue, sp !== undefined ? sp : statePath, validate(newValue, _this4.props));
            },
            statePath: statePath,
            getValue: root ? function () {
              return _this4.value;
            } : undefined
          }));
        }
      }]);

      return FormElementContainer;
    }(React.Component);

    // $FlowFixMe


    FormElementContainer.defaultProps = {
      elementName: WrappedComponent.defaultProps && WrappedComponent.defaultProps.elementName || undefined
    };

    FormElementContainer.contextTypes = {
      statePath: _propTypes2.default.string,
      completeStatePath: _propTypes2.default.string,
      valueChangeObs: _propTypes2.default.any,
      onStateChange: _propTypes2.default.func,
      addHandler: _propTypes2.default.func,
      rootValueChangeObs: _propTypes2.default.any
    };

    FormElementContainer.childContextTypes = {
      statePath: _propTypes2.default.string,
      completeStatePath: _propTypes2.default.string
    };

    return FormElementContainer;
  };
}