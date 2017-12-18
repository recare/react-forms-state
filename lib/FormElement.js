"use babel";
// @flow

import * as React from "react";
import { getValue, setValue } from "./StateValueHelpers";
import {
  INITIAL_CHANGE_EVENT_TYPE,
  VALUE_CHANGE_EVENT_TYPE,
  VALIDATION_FAILED_EVENT_TYPE,
} from "./FormEvents";
import type { FormEvent } from "./FormEvents";
import Rx from "rxjs/Rx";
import { Validation } from "./ValidationHelpers";
import PropTypes from "prop-types";

const NeverObservable = Rx.Observable.never();

type Props<V> = {
  elementName?: string,
  valueChangeObs?: Rx.Observable,
  __debug?: boolean,
  uncontrolled?: boolean,
  value?: V,
  validation?: Validation,
  onChange?: (newValue: V, statePath: string, valid: boolean) => void,
};

type State = {
  value: mixed,
  validation?: Validation,
};

export default function FormElement({
  root = false,
  validate = () => true,
  getUncontrolledValue,
  setUncontrolledValue,
}: {
  root?: boolean,
  validate?: (value: any, props: Object) => boolean,
  getUncontrolledValue?: (child: React.ElementType) => any,
  setUncontrolledValue?: (child: React.ElementType, value: mixed) => any,
} = {}) {
  return function FormElementHOC(WrappedComponent: React.ComponentType<any>) {
    class FormElementContainer extends React.Component<Props<*>, State> {
      parentValueChangeObs: Rx.Subject<FormEvent>;
      valueChangeObs: Rx.Subject<FormEvent>;
      subscription: Rx.Subscription;
      value: ?any;
      validation: ?any;
      child: React.ElementType;

      constructor(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        super(props);

        this.state = {
          value: null,
        };
        this.configureObs(props, context);
      }

      getHumanReadableIdentifier(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        const currentStatePath = this.getCurrentStatePath(props, context, {});
        return `ProxiedField with statePath ${
          currentStatePath != null && currentStatePath !== ""
            ? currentStatePath
            : '""'
        } and elementName ${
          props.elementName !== "" && props.elementName !== undefined
            ? props.elementName
            : '""'
        }`;
      }

      getAssignedObs(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        if (props.valueChangeObs) {
          return props.valueChangeObs;
        } else if (context.valueChangeObs) {
          return context.valueChangeObs;
        } else {
          return NeverObservable;
        }
      }

      configureObs(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        this.parentValueChangeObs = this.getAssignedObs(props, context);
        if (this.parentValueChangeObs === NeverObservable && props.__debug)
          console.warn(
            `${this.getHumanReadableIdentifier(
              props,
              context,
            )} hasn't received any valueChangeObs neither as props nor context. Maybe you have forgotten the FormController / StateDispatcher duo`,
          );
        this.valueChangeObs = this.parentValueChangeObs
          .do(e => {
            if (props.__debug) {
              const path = this.getCompleteCurrentStatePath(
                props,
                context,
                e.value,
              );
              if (path !== "" && e.type === VALUE_CHANGE_EVENT_TYPE) {
                console.log(
                  "FILTERING",
                  path,
                  "FOR STATEPATH",
                  e.statePath,
                  "PROPS",
                  props,
                  "CONTEXT",
                  context,
                );
              }
            }
          })
          .filter(e => {
            const path = this.getCompleteCurrentStatePath(
              props,
              context,
              e.value,
            );
            return (
              e.type === INITIAL_CHANGE_EVENT_TYPE ||
              e.type === VALIDATION_FAILED_EVENT_TYPE ||
              path.startsWith(e.statePath) ||
              (root && e.statePath.startsWith(path))
            );
          })
          .do(e => {
            if (props.__debug) {
              const path = this.getCompleteCurrentStatePath(
                props,
                context,
                e.value,
              );
              if (path !== "" && e.type === VALUE_CHANGE_EVENT_TYPE) {
                console.log("REFRESHING", path, "FOR EVENT", e);
              }
            }
          })
          .map(e =>
            Object.assign({}, e, {
              value: getValue(
                e.value,
                this.getCurrentStatePath(props, context, e.value),
              ),
              validation:
                e.validation && e.validation instanceof Validation
                  ? e.validation.getNestedValidation(
                      this.getCurrentStatePath(props, context, e.value),
                    )
                  : e.validation,
            }),
          )
          .do(e => {
            if (props.__debug) {
              console.log("FOUND VALUE:", e);
            }
          });
      }

      connectToFormController(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        if (this.valueChangeObs && this.isControlled(props, context)) {
          this.disconnectFromFormController();
          this.subscription = this.valueChangeObs.subscribe(e => {
            if (props.__debug) {
              console.log(
                "Setting value",
                e,
                `in ${root ? "instance" : "state"} mode`,
              );
            }
            if (e.value === undefined) {
              console.warn(
                `${this.getHumanReadableIdentifier(
                  props,
                  context,
                )} doesn't have any value set in the state, it may break`,
              );
            }
            if (root) {
              this.value = e.value;
              this.validation = e.validation;
            } else {
              this.setState({
                value: e.value,
                validation: e.validation,
              });
            }
          });
        }
      }

      disconnectFromFormController() {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
      }

      connectToUncontrolledHandlers(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        if (
          props.elementName &&
          context.addHandler &&
          !this.isControlled(props, context)
        ) {
          if (getUncontrolledValue == null || setUncontrolledValue == null) {
            console.warn(
              `${this.getHumanReadableIdentifier(
                props,
                context,
              )} is uncontrolled but has no getValue / setValue defined, thus it is disabled and not connected`,
            );
          } else {
            context.addHandler(
              this.getCurrentStatePath(props, context),
              () =>
                root
                  ? this.getUncontrolledState()
                  : getUncontrolledValue && getUncontrolledValue(this.child),
              value =>
                root
                  ? // $FlowFixMe
                    this.child.dispatchUncontrolledValues({ value: value })
                  : setUncontrolledValue &&
                    setUncontrolledValue(this.child, value),
            );
          }
        }
      }

      componentDidMount() {
        this.connectToUncontrolledHandlers(this.props, this.context);
        this.connectToFormController(this.props, this.context);
      }

      // $FlowFixMe
      componentWillReceiveProps(nextProps, nextContext) {
        if (
          this.parentValueChangeObs !==
          this.getAssignedObs(nextProps, nextContext)
        ) {
          console.log(
            `Reconnecting ${this.getHumanReadableIdentifier(
              nextProps,
              nextContext,
            )}`,
          );
          this.configureObs(nextProps, nextContext);
          this.connectToFormController(nextProps, nextContext);
        }
      }

      componentWillUnmount() {
        this.disconnectFromFormController();
      }

      getNewPathPart(
        props: Props<*>,
        // $FlowFixMe
        context,
        v: mixed,
      ) {
        let value = getValue(v, context.statePath || "");
        if (typeof value === "object" && Array.isArray(value)) {
          let index = value.findIndex(v => v.id === props.elementName);
          return (index !== -1 ? index : "") + ".value";
        } else {
          return props.elementName || "";
        }
      }

      getNewCompletePathPart(
        props: Props<*>,
        // $FlowFixMe
        context,
        v: mixed,
      ) {
        let value = getValue(v, context.completeStatePath || "");
        if (typeof value === "object" && Array.isArray(value)) {
          let index = value.findIndex(v => v.id === props.elementName);
          return (index !== -1 ? index : "") + ".value";
        } else {
          return props.elementName || "";
        }
      }

      getCurrentStatePath(
        props: Props<*>,
        // $FlowFixMe
        context,
        value: mixed,
      ) {
        if (context.statePath && context.statePath !== "" && props.elementName)
          return (
            context.statePath + "." + this.getNewPathPart(props, context, value)
          );
        else if (props.elementName)
          return this.getNewPathPart(props, context, value);
        else if (context.statePath) return context.statePath;
        else return "";
      }

      getCompleteCurrentStatePath(
        props: Props<*>,
        // $FlowFixMe
        context,
        value: mixed,
      ) {
        if (
          props.valueChangeObs == null &&
          context.completeStatePath &&
          context.completeStatePath !== "" &&
          props.elementName
        )
          return (
            context.completeStatePath +
            "." +
            this.getNewCompletePathPart(props, context, value)
          );
        else if (props.elementName)
          return this.getNewCompletePathPart(props, context, value);
        else if (props.valueChangeObs == null && context.completeStatePath)
          return context.completeStatePath;
        else return "";
      }

      isControlled(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        return props.uncontrolled || context.uncontrolled ? false : true;
      }

      getStatePathToDispatch(
        props: Props<*>,
        // $FlowFixMe
        context,
      ) {
        if (root) return "";
        else return this.getCurrentStatePath(props, context);
      }

      getChildContext() {
        return {
          statePath: this.getStatePathToDispatch(this.props, this.context),
          completeStatePath: this.getCompleteCurrentStatePath(
            this.props,
            this.context,
          ),
          uncontrolled: this.isControlled(this.props, this.context) === false,
        };
      }

      getUncontrolledState() {
        // $FlowFixMe
        return this.child.getUncontrolledState();
      }

      render() {
        const value =
          this.state.value == undefined && this.props.value !== undefined
            ? this.props.value
            : this.state.value;
        const validation =
          this.state.validation == undefined &&
          this.props.validation !== undefined
            ? this.props.validation
            : this.state.validation;
        const statePath = this.getCurrentStatePath(this.props, this.context);
        if (this.isControlled(this.props, this.context)) {
          return (
            <WrappedComponent
              {...Object.assign({}, this.props, {
                value: value,
                validation: validation,
                valueChangeObs: this.valueChangeObs,
                rootValueChangeObs: this.context.rootValueChangeObs
                  ? this.context.rootValueChangeObs
                  : this.valueChangeObs,
                onChange:
                  this.props.onChange != null
                    ? (newValue, sp) => {
                        // $FlowFixMe
                        this.props.onChange(
                          newValue,
                          sp !== undefined ? sp : statePath,
                          validate(newValue, this.props),
                        );
                      }
                    : (newValue, sp) => {
                        this.context.onStateChange(
                          newValue,
                          sp !== undefined ? sp : statePath,
                          validate(newValue, this.props),
                        );
                      },
                statePath: statePath,
                getValue: root ? () => this.value : undefined,
              })}
              // $FlowFixMe
              ref={elem => (this.child = elem)}
            />
          );
        } else {
          return (
            <WrappedComponent
              {...Object.assign({}, this.props, {
                statePath: statePath,
                getValue: root ? () => this.value : undefined,
              })}
              // $FlowFixMe
              ref={elem => (this.child = elem)}
            />
          );
        }
      }
    }

    // $FlowFixMe
    FormElementContainer.defaultProps = {
      uncontrolled: false,
      elementName:
        (WrappedComponent.defaultProps &&
          WrappedComponent.defaultProps.elementName) ||
        undefined,
    };

    FormElementContainer.contextTypes = {
      statePath: PropTypes.string,
      completeStatePath: PropTypes.string,
      valueChangeObs: PropTypes.any,
      onStateChange: PropTypes.func,
      addHandler: PropTypes.func,
      uncontrolled: PropTypes.bool,
      rootValueChangeObs: PropTypes.any,
    };

    FormElementContainer.childContextTypes = {
      statePath: PropTypes.string,
      completeStatePath: PropTypes.string,
      uncontrolled: PropTypes.bool,
    };

    return FormElementContainer;
  };
}
