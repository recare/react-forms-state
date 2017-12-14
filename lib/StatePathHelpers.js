"use babel";
// @flow

import { getValue } from "./StateValueHelpers";

export function getImmutPath(path: string): Array<string | number> {
  if (path === "") return [];
  return path.split(".").map(p => (isNaN(p) ? p : parseInt(p)));
}

export function getNewPath(
  immutState: Object,
  statePath: string,
  name: string,
): string {
  const value = getValue(immutState, statePath);
  if (Array.isArray(value)) {
    let index = value.findIndex(
      obj => obj && typeof obj === "object" && obj.id === name,
    );
    return `${statePath}${statePath.length > 0 ? "." : ""}${index}.value`;
  } else {
    return `${statePath}${statePath.length > 0 ? "." : ""}${name}`;
  }
}
