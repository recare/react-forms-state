"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = Form;

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _immutable = require("immutable");

var _Rx = require("rxjs/Rx");

var _Rx2 = _interopRequireDefault(_Rx);

var _FormEvents = require("./FormEvents");

var _StateValueHelpers = require("./StateValueHelpers");

var _ValidationHelpers = require("./ValidationHelpers");

var _StateDispatcher = require("./StateDispatcher");

var _StateDispatcher2 = _interopRequireDefault(_StateDispatcher);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// $FlowFixMe


function getNewValidation(acc, next) {
  switch (next.type) {
    case _FormEvents.VALUE_CHANGE_EVENT_TYPE:
    case _FormEvents.INITIAL_CHANGE_EVENT_TYPE:
    case _FormEvents.VALIDATION_FAILED_EVENT_TYPE:
      return next.validation || acc.validation;
    default:
      return acc.validation;
  }
}

function Form() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$applyControl = _ref.applyControl,
      applyControl = _ref$applyControl === undefined ? function (state) {
    return state;
  } : _ref$applyControl,
      _ref$convertIn = _ref.convertIn,
      convertIn = _ref$convertIn === undefined ? function (value, props) {
    return value;
  } : _ref$convertIn,
      _ref$convertOut = _ref.convertOut,
      convertOut = _ref$convertOut === undefined ? function (value, props) {
    return value;
  } : _ref$convertOut,
      _ref$validate = _ref.validate,
      validate = _ref$validate === undefined ? function (value, props) {
    return true;
  } : _ref$validate,
      _ref$checkIfModified = _ref.checkIfModified,
      checkIfModified = _ref$checkIfModified === undefined ? false : _ref$checkIfModified,
      _ref$immutableInitial = _ref.immutableInitial,
      immutableInitial = _ref$immutableInitial === undefined ? false : _ref$immutableInitial;

  return function FormHOC(WrappedComponent) {
    var WrappedComponentWithDispatcher = (0, _StateDispatcher2.default)()(WrappedComponent);

    var FormContainer = function (_React$Component) {
      _inherits(FormContainer, _React$Component);

      function FormContainer(props) {
        _classCallCheck(this, FormContainer);

        var _this = _possibleConstructorReturn(this, (FormContainer.__proto__ || Object.getPrototypeOf(FormContainer)).call(this));

        _this.subject = new _Rx2.default.Subject().scan(function (acc, next) {
          switch (next.type) {
            case _FormEvents.VALUE_CHANGE_EVENT_TYPE:
              var newState = (0, _StateValueHelpers.setValue)(acc.value, next.statePath, next.newValue);
              var controlledNewState = applyControl(newState);
              return {
                type: _FormEvents.VALUE_CHANGE_EVENT_TYPE,
                value: controlledNewState,
                oldValue: acc.value,
                statePath: next.statePath,
                validation: getNewValidation(acc, next)
              };
            case _FormEvents.SUBMIT_EVENT_TYPE:
              return {
                type: _FormEvents.SUBMIT_EVENT_TYPE,
                value: acc.value,
                validation: acc.validation
              };
            case _FormEvents.INITIAL_CHANGE_EVENT_TYPE:
              return {
                type: _FormEvents.INITIAL_CHANGE_EVENT_TYPE,
                value: next.newValue,
                oldValue: acc.value,
                validation: getNewValidation(acc, next)
              };
            case _FormEvents.VALIDATION_FAILED_EVENT_TYPE:
              return {
                type: _FormEvents.VALIDATION_FAILED_EVENT_TYPE,
                value: acc.value,
                validation: next.validation
              };
            default:
              return acc;
          }
        }, { type: "INITIAL_CHANGE", value: _this._getInitialValue(props), validation: true }).do(function (e) {
          return global.process && global.process.env && global.process.env.FORMALIZR_ENV === "DEBUG" && console.log("Form event:\n", e);
        }).share();
        _this.subject.filter(function (e) {
          return e.type === _FormEvents.SUBMIT_EVENT_TYPE;
        }).subscribe({
          next: function next(e) {
            return _this._submit(e.value);
          }
        });
        _this.valueChangeObs = _this.subject.filter(function (e) {
          return e.type === _FormEvents.VALUE_CHANGE_EVENT_TYPE || e.type === _FormEvents.INITIAL_CHANGE_EVENT_TYPE || e.type === _FormEvents.VALIDATION_FAILED_EVENT_TYPE;
        }).publishBehavior({
          type: _FormEvents.INITIAL_CHANGE_EVENT_TYPE,
          value: _this._getInitialValue(props),
          validation: true
        }).refCount();
        _this.rootDispatcherGetter = null;
        return _this;
      }

      _createClass(FormContainer, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
          var newInitial = this._getInitialValue(nextProps);
          var oldInitial = this._getInitialValue(this.props);
          if (oldInitial != null && "toJS" in oldInitial && newInitial != null && "toJS" in newInitial || immutableInitial) {
            if (newInitial !== oldInitial) this.subject.next((0, _FormEvents.createInitialChangeEvent)(newInitial));
          } else if (oldInitial == null && newInitial != null) {
            this.subject.next((0, _FormEvents.createInitialChangeEvent)(newInitial));
          } else if (oldInitial != null && newInitial != null) {
            if (!(0, _immutable.is)((0, _immutable.fromJS)(newInitial), (0, _immutable.fromJS)(oldInitial))) this.subject.next((0, _FormEvents.createInitialChangeEvent)(newInitial));
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.subject.unsubscribe();
        }
      }, {
        key: "_getInitialValue",
        value: function _getInitialValue(props) {
          var v = typeof props.formInputValue !== "function" ? props.formInputValue : props.formInputValue(props);
          return convertIn(v == null ? {} : v, props);
        }
      }, {
        key: "_mergeValues",
        value: function _mergeValues(value) {
          return (0, _immutable.fromJS)(value).mergeDeep(this.rootDispatcherGetter ? (0, _immutable.fromJS)(this.rootDispatcherGetter()) : (0, _immutable.fromJS)({}));
        }
      }, {
        key: "_submit",
        value: function _submit(value) {
          var newValue = this._mergeValues(value);
          if (checkIfModified === false || !(0, _immutable.is)(newValue, (0, _immutable.fromJS)(this._getInitialValue(this.props)))) {
            var validation = validate(newValue.toJS(), this.props);
            if (validation === true || validation == null) {
              if (this.props.onSubmit == null) {
                console.warn("Form hasn't received any onSubmit function as props, you may have forgotten it");
              } else {
                this.props.onSubmit(convertOut(newValue.toJS(), this.props));
              }
            } else {
              var newValidation = new _ValidationHelpers.Validation(validation);
              if (typeof this.props.onValidationFailed === "function") {
                this.props.onValidationFailed(newValidation);
              }
              this.subject.next((0, _FormEvents.createValidationFailedEvent)(newValidation));
            }
          }
        }
      }, {
        key: "getChildContext",
        value: function getChildContext() {
          var _this2 = this;

          return {
            attachToForm: function attachToForm(getter) {
              _this2.rootDispatcherGetter = getter;
            }
          };
        }
      }, {
        key: "render",
        value: function render() {
          var _this3 = this;

          return React.createElement(WrappedComponentWithDispatcher, _extends({}, this.props, {
            onChange: function onChange(value, statePath, validation) {
              return _this3.subject.next((0, _FormEvents.createValueChangeEvent)(value, statePath, validation));
            },
            valueChangeObs: this.valueChangeObs,
            submit: function submit() {
              return _this3.subject.next((0, _FormEvents.createSubmitChangeEvent)());
            }
          }));
        }
      }]);

      return FormContainer;
    }(React.Component);

    FormContainer.childContextTypes = {
      attachToForm: _propTypes2.default.func
    };

    return FormContainer;
  };
}