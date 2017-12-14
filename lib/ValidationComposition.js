// @flow

// $FlowFixMe
import { fromJS } from "immutable";

type ValidationResult = string | boolean;

export function composeValidation(
  ...validates: Array<(value: mixed, props: Object) => ValidationResult>
) {
  return function validateValue(value: mixed, props: Object) {
    return validates.reduce((red, validate) => {
      if (red !== true) return red;
      const validated = validate(value, props);
      if (validated === true) return true;
      else return validated;
    }, true);
  };
}

export function notNull({
  errorString = "Not filled",
}: {
  errorString?: string,
} = {}) {
  return function validateNotNull(value: mixed): ValidationResult {
    if (value === null) {
      return errorString;
    } else {
      return true;
    }
  };
}

export function notUndefined({
  errorString = "Not filled",
}: {
  errorString?: string,
} = {}) {
  return function validateNotUndefined(value: mixed): ValidationResult {
    if (value === undefined) {
      return errorString;
    } else {
      return true;
    }
  };
}

export function notEmpty({
  errorString = "Not filled",
}: {
  errorString?: string,
} = {}) {
  return function validateNotEmpty(value: mixed): ValidationResult {
    if (value === "") {
      return errorString;
    } else {
      return true;
    }
  };
}

export function required({
  errorString = "Not filled",
}: {
  errorString?: string,
} = {}) {
  return composeValidation(
    notUndefined({ errorString }),
    notNull({ errorString }),
    notEmpty({ errorString }),
  );
}

export function isTrue({
  errorString = "not true",
}: { errorString?: string } = {}) {
  return function validateTrue(value: mixed): ValidationResult {
    if (value !== true) {
      return errorString;
    } else {
      return true;
    }
  };
}

export function maxLength(
  max: number,
  { errorString = "too long" }: { errorString?: string } = {},
) {
  return function validateMaxLength(value: mixed): ValidationResult {
    if (typeof value !== "string" || value.length > max) {
      return errorString;
    } else {
      return true;
    }
  };
}

export function lessThan<T, U: string | number, Props: {}>(
  accessor1: (value: T, props: Props) => U,
  accessor2: (value: T, props: Props) => U,
  {
    error,
  }: {
    error: ((value: T, props: Props) => ValidationResult) | ValidationResult,
  } = {
    error: "Invalid",
  },
) {
  return function validateLessThan(value: T, props: Props): ValidationResult {
    if (
      (typeof accessor1 !== "function" && typeof accessor1 !== "string") ||
      (typeof accessor2 !== "function" && typeof accessor2 !== "string")
    )
      throw new Error(
        "lessThan validator takes either a function or a stringPath as accessor type",
      );
    const value1 =
      typeof accessor1 === "function"
        ? accessor1(value, props)
        : fromJS(value).getIn(accessor1.split("."));
    const value2 =
      typeof accessor2 === "function"
        ? accessor2(value, props)
        : fromJS(value).getIn(accessor2.split("."));

    if (typeof value1 === "number" && typeof value2 === "number") {
      if (value1 > value2) {
        if (typeof error === "function") return error(value, props);
        else return error;
      } else {
        return true;
      }
    } else if (typeof value1 === "string" && typeof value2 === "string") {
      if (value1 > value2) {
        if (typeof error === "function") return error(value, props);
        else return error;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };
}
