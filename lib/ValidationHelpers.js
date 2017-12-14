"use babel";
// @flow

// $FlowFixMe
import { fromJS } from "immutable";
import { getJavascriptEntity } from "./StateValueHelpers";
import { getImmutPath } from "./StatePathHelpers";

export type ValidationInfo =
  | { [key: string | number]: ValidationInfo }
  | string
  | boolean;

export function isValid(validation: Validation): boolean {
  if (typeof validation === "boolean") return validation;
  else if (validation == null) return true;
  else if (
    typeof validation === "object" &&
    typeof validation.infos === "object" &&
    validation.infos !== null &&
    Object.keys(validation.infos).length === 0
  )
    return true;
  else {
    return validation.infos === true || validation.infos == null;
  }
}

export function getErrorText(validation: Validation): ?string {
  if (typeof validation.infos === "string") return validation.infos;
  else return null;
}

function setErrorForFieldAt(
  infos: ValidationInfo,
  statePath: string,
  error: ?string,
): ValidationInfo {
  if (statePath === "" || infos == null || typeof infos !== "object") {
    return infos;
  } else {
    return fromJS(infos)
      .setIn(getImmutPath(statePath), error)
      .toJS();
  }
}

function removeErrorForFieldAt(
  infos: ValidationInfo,
  statePath: string,
): ValidationInfo {
  return setErrorForFieldAt(infos, statePath, null);
}

export class Validation {
  infos: ValidationInfo;

  constructor(infos: ValidationInfo = {}) {
    this.infos = infos;
  }

  setErrorForFieldAt(statePath: string, error: string): Validation {
    return new Validation(setErrorForFieldAt(this.infos, statePath, error));
  }

  removeErrorForFieldAt(statePath: string): Validation {
    return new Validation(removeErrorForFieldAt(this.infos, statePath));
  }

  getErrorForFieldAt(statePath: string): ?ValidationInfo {
    if (statePath === "") return getJavascriptEntity(this.infos);
    else {
      if (typeof this.infos === "object") {
        let valuePath = getImmutPath(statePath);
        return valuePath.reduce((red, value) => {
          if (red !== undefined && red !== null && typeof red === "object") {
            return red[value];
          } else {
            return red;
          }
        }, this.infos);
      } else return null;
    }
  }

  getNestedValidation(statePath: string): Validation {
    if (statePath === "") {
      return this;
    } else {
      // $FlowFixMe
      return new Validation(this.getErrorForFieldAt(statePath));
    }
  }
}
