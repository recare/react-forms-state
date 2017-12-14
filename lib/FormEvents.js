"use babel";
// @flow

import { Validation } from "./ValidationHelpers";

export const VALUE_CHANGE_EVENT_TYPE = "VALUE_CHANGE";
export const INITIAL_CHANGE_EVENT_TYPE = "INITIAL_CHANGE";
export const SUBMIT_EVENT_TYPE = "SUBMIT";
export const VALIDATION_FAILED_EVENT_TYPE = "VALIDATION_FAILED";

type BaseEventType = {
  type: "VALUE_CHANGE" | "INITIAL_CHANGE" | "SUBMIT" | "VALIDATION_FAILED",
};

export type ValueChangeEventType = {
  type: "VALUE_CHANGE",
  newValue: any,
  statePath: string,
  validation: Validation | boolean,
};

export type InitialChangeEventType = {
  type: "INITIAL_CHANGE",
  newValue: any,
  validation?: Validation | boolean,
};

export type SubmitChangeEventType = {
  type: "SUBMIT",
};

export type ValidationFailedEventType = {
  type: "VALIDATION_FAILED",
  validation: Validation | boolean,
};

export type FormEvent =
  | ValueChangeEventType
  | InitialChangeEventType
  | SubmitChangeEventType
  | ValidationFailedEventType;

export type AccumulatorEventType = BaseEventType & {
  value: any,
  oldValue?: any,
  newValue?: any,
  statePath?: string,
  validation: Validation | boolean,
};

export function createValueChangeEvent(
  newValue: any,
  statePath: string,
  validation: Validation | boolean,
): ValueChangeEventType {
  return {
    type: VALUE_CHANGE_EVENT_TYPE,
    newValue,
    statePath,
    validation,
  };
}

export function createInitialChangeEvent(
  newInitial: any,
): InitialChangeEventType {
  return {
    type: INITIAL_CHANGE_EVENT_TYPE,
    newValue: newInitial,
  };
}

export function createSubmitChangeEvent(): SubmitChangeEventType {
  return {
    type: SUBMIT_EVENT_TYPE,
  };
}

export function createValidationFailedEvent(
  validation: Validation | boolean,
): ValidationFailedEventType {
  return {
    type: VALIDATION_FAILED_EVENT_TYPE,
    validation: validation,
  };
}
