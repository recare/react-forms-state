"use babel";
// @flow

import * as React from "react";
// $FlowFixMe
import { fromJS, is } from "immutable";
import { Subject } from "rxjs/Rx";

import { map, scan, filter } from "rxjs/operators";

import {
  INITIAL_CHANGE_EVENT_TYPE,
  VALIDATION_FAILED_EVENT_TYPE,
  VALUE_CHANGE_EVENT_TYPE,
  SUBMIT_EVENT_TYPE,
  createInitialChangeEvent,
  createSubmitChangeEvent,
  createValidationFailedEvent,
  createValueChangeEvent,
} from "./FormEvents";
import type { FormEvent, AccumulatorEventType } from "./FormEvents";
import { setValue } from "./StateValueHelpers";
import { Validation, type ValidationInfo } from "./ValidationHelpers";
import StateDispatcher from "./StateDispatcher";
import PropTypes from "prop-types";

function getNewValidation(
  acc: AccumulatorEventType,
  next: FormEvent,
): Validation | boolean {
  switch (next.type) {
    case VALUE_CHANGE_EVENT_TYPE:
    case INITIAL_CHANGE_EVENT_TYPE:
    case VALIDATION_FAILED_EVENT_TYPE:
      return next.validation || acc.validation;
    default:
      return acc.validation;
  }
}

type Props = {
  formInputValue: () => {} | {},
  onSubmit: mixed => void,
  onValidationFailed: Validation => void,
};

export default function Form({
  applyControl = state => state,
  convertIn = (value, props) => value,
  convertOut = (value, props) => value,
  validate = (value, props) => true,
  checkIfModified = false,
  immutableInitial = false,
}: {
  applyControl?: (state: any) => any,
  convertIn?: (value: any, props: any) => Object,
  convertOut?: (value: any, props: any) => Object,
  validate?: (value: any, props: any) => ValidationInfo,
  checkIfModified?: boolean,
  immutableInitial?: boolean,
} = {}): (Comp: React.ComponentType<any>) => React.ComponentType<any> {
  return function FormHOC(
    WrappedComponent: React.ComponentType<any>,
  ): React.ComponentType<any> {
    const WrappedComponentWithDispatcher = StateDispatcher()(WrappedComponent);

    class FormContainer extends React.Component<any, any> {
      subject: Subject<FormEvent>;
      valueChangeObs: Subject<FormEvent>;
      rootDispatcherGetter: ?() => any;

      constructor(props) {
        super();
        this.subject = new Subject()
          .scan((acc: AccumulatorEventType, next: FormEvent) => {
            switch (next.type) {
              case VALUE_CHANGE_EVENT_TYPE:
                const newState = setValue(
                  acc.value,
                  next.statePath,
                  next.newValue,
                );
                const controlledNewState = applyControl(newState);
                return ({
                  type: VALUE_CHANGE_EVENT_TYPE,
                  value: controlledNewState,
                  oldValue: acc.value,
                  statePath: next.statePath,
                  validation: getNewValidation(acc, next),
                }: AccumulatorEventType);
              case SUBMIT_EVENT_TYPE:
                return ({
                  type: SUBMIT_EVENT_TYPE,
                  value: acc.value,
                  validation: acc.validation,
                }: AccumulatorEventType);
              case INITIAL_CHANGE_EVENT_TYPE:
                return ({
                  type: INITIAL_CHANGE_EVENT_TYPE,
                  value: next.newValue,
                  oldValue: acc.value,
                  validation: getNewValidation(acc, next),
                }: AccumulatorEventType);
              case VALIDATION_FAILED_EVENT_TYPE:
                return ({
                  type: VALIDATION_FAILED_EVENT_TYPE,
                  value: acc.value,
                  validation: next.validation,
                }: AccumulatorEventType);
              default:
                return acc;
            }
          }, ({ type: "INITIAL_CHANGE", value: this._getInitialValue(props), validation: true }: AccumulatorEventType))
          .do(
            e =>
              global.process &&
              global.process.env &&
              global.process.env.FORMALIZR_ENV === "DEBUG" &&
              console.log("Form event:\n", e),
          )
          .share();
        this.subject.filter(e => e.type === SUBMIT_EVENT_TYPE).subscribe({
          next: e => this._submit(e.value),
        });
        this.valueChangeObs = this.subject
          .filter(
            e =>
              e.type === VALUE_CHANGE_EVENT_TYPE ||
              e.type === INITIAL_CHANGE_EVENT_TYPE ||
              e.type === VALIDATION_FAILED_EVENT_TYPE,
          )
          .publishBehavior({
            type: INITIAL_CHANGE_EVENT_TYPE,
            value: this._getInitialValue(props),
            validation: true,
          })
          .refCount();
        this.rootDispatcherGetter = null;
      }

      componentWillReceiveProps(nextProps) {
        let newInitial = this._getInitialValue(nextProps);
        let oldInitial = this._getInitialValue(this.props);
        if (
          (oldInitial != null &&
            "toJS" in oldInitial &&
            newInitial != null &&
            "toJS" in newInitial) ||
          immutableInitial
        ) {
          if (newInitial !== oldInitial)
            this.subject.next(createInitialChangeEvent(newInitial));
        } else if (oldInitial == null && newInitial != null) {
          this.subject.next(createInitialChangeEvent(newInitial));
        } else if (oldInitial != null && newInitial != null) {
          if (!is(fromJS(newInitial), fromJS(oldInitial)))
            this.subject.next(createInitialChangeEvent(newInitial));
        }
      }

      componentWillUnmount() {
        this.subject.unsubscribe();
      }

      _getInitialValue(props) {
        let v =
          typeof props.formInputValue !== "function"
            ? props.formInputValue
            : props.formInputValue(props);
        return convertIn(v == null ? {} : v, props);
      }

      _mergeValues(value) {
        return fromJS(value).mergeDeep(
          this.rootDispatcherGetter
            ? fromJS(this.rootDispatcherGetter())
            : fromJS({}),
        );
      }

      _submit(value) {
        let newValue = this._mergeValues(value);
        if (
          checkIfModified === false ||
          !is(newValue, fromJS(this._getInitialValue(this.props)))
        ) {
          const validation = validate(newValue.toJS(), this.props);
          if (validation === true || validation == null) {
            if (this.props.onSubmit == null) {
              console.warn(
                "Form hasn't received any onSubmit function as props, you may have forgotten it",
              );
            } else {
              this.props.onSubmit(convertOut(newValue.toJS(), this.props));
            }
          } else {
            const newValidation = new Validation(validation);
            if (typeof this.props.onValidationFailed === "function") {
              this.props.onValidationFailed(newValidation);
            }
            this.subject.next(createValidationFailedEvent(newValidation));
          }
        }
      }

      getChildContext() {
        return {
          attachToForm: getter => {
            this.rootDispatcherGetter = getter;
          },
        };
      }
      render() {
        return (
          <WrappedComponentWithDispatcher
            {...this.props}
            onChange={(value: any, statePath: string, validation: Validation) =>
              this.subject.next(
                createValueChangeEvent(value, statePath, validation),
              )
            }
            valueChangeObs={this.valueChangeObs}
            submit={() => this.subject.next(createSubmitChangeEvent())}
          />
        );
      }
    }

    FormContainer.childContextTypes = {
      attachToForm: PropTypes.func,
    };

    return FormContainer;
  };
}
