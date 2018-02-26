"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// $FlowFixMe


exports.convertConversionModelToConversionJobs = convertConversionModelToConversionJobs;
exports.convertIn = convertIn;
exports.convertOut = convertOut;
exports.validateModel = validateModel;

var _immutable = require("immutable");

function convertConversionModelToConversionJobs(model) {
  var currentInPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var parentOutPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

  if ((typeof model === "undefined" ? "undefined" : _typeof(model)) !== "object" || model == null) {
    return (0, _immutable.List)();
  }
  var currentNodeOutPath = "out" in model || "out_path" in model ? model.out || model.out_path || "" : "";
  var currentOutPath = "" + (parentOutPath !== "" ? parentOutPath + "." + currentNodeOutPath : currentNodeOutPath);
  return (0, _immutable.List)().concat(currentInPath !== "" ? _immutable.List.of({
    in: currentInPath,
    out: currentOutPath,
    convertIn: "convertIn" in model ? model.convertIn : undefined,
    convertOut: "convertOut" in model ? model.convertOut : undefined,
    default: model.default,
    validate: "validate" in model ? model.validate : undefined
  }) : (0, _immutable.List)()).concat(Object.keys(model).filter(function (nodeKey) {
    return !["convertIn", "convertOut", "out", "out_path", "complex", "default", "validate"].includes(nodeKey);
  }).reduce(function (red, nodeKey) {
    var childNode = model[nodeKey];
    var childInPath = currentInPath ? currentInPath + "." + nodeKey : nodeKey;
    return red.concat(convertConversionModelToConversionJobs(childNode, childInPath, currentOutPath));
  }, (0, _immutable.List)()));
}

function convertIn(jobs) {
  return function convertInModelValue(value, props) {
    if (value == null) return {};
    var immutableValue = (0, _immutable.fromJS)(value);
    if (props && props.__debug && console.groupCollapsed) {
      console.groupCollapsed("Form ConvertIn");
    }
    var convertedValue = jobs.reduceRight(function (red, job) {
      var inPath = job.in.split(".");
      var outPath = job.out.split(".");
      var notConvertedValue = inPath.length === 1 && inPath[0] === "" ? immutableValue : immutableValue.getIn(inPath, red.getIn(outPath, job.default));
      var inValue = typeof job.convertIn === "function" ? job.convertIn(notConvertedValue, props, immutableValue) : notConvertedValue;
      var newRed = void 0;
      if (red.getIn(outPath) != null && inValue != null && inValue !== false || outPath.length === 1 && outPath[0] === "") newRed = red;else {
        newRed = red.setIn(outPath, (0, _immutable.fromJS)(inValue));
      }
      if (props && props.__debug) {
        console.log("ConvertIn reducing...", "\nState (initial, red):", immutableValue, red, "\nJob:", job, "\nIn:", inPath, inValue, "converted from", notConvertedValue, "\nOut:", outPath, "\nNew reduction:", newRed);
      }
      return newRed;
    }, (0, _immutable.Map)()).toJS();
    if (props && props.__debug) {
      console.log("ConvertIn converted", value, "into", convertedValue, "with props", props, "and jobs", jobs);
      if (console.groupEnd) {
        console.groupEnd();
      }
    }
    return convertedValue;
  };
}

function convertOut(jobs) {
  return function convertOutModelValue(value, props) {
    if (value == null) return {};
    var immutableValue = (0, _immutable.fromJS)(value);
    if (props && props.__debug && console.groupCollapsed) {
      console.groupCollapsed("Form ConvertOut");
    }
    var convertedValue = jobs.reduceRight(function (red, job) {
      var outPath = job.out.split(".");
      var notConvertedValue = immutableValue.getIn(outPath);
      var outValue = typeof job.convertOut === "function" ? job.convertOut(notConvertedValue, props, immutableValue) : notConvertedValue;
      if (outValue === undefined) {
        return red;
      }
      var inPath = job.in.split(".");
      var newRed = void 0;
      if ((red.getIn(inPath) != null && outValue != null || inPath.length === 1 && inPath[0] === "") && !job.convertOut) newRed = red;else {
        newRed = red.setIn(inPath, outValue);
      }
      if (props && props.__debug) {
        console.log("ConvertOut reducing...", "\nState (initial, red):", immutableValue, red, "\nJob:", job, "\nOut:", outPath, outValue, "converted from", notConvertedValue, "\nIn:", inPath, "\nNew reduction:", newRed);
      }
      return newRed;
    }, (0, _immutable.Map)()).toJS();
    if (props && props.__debug) {
      console.log("ConvertOut converted", value, "into", convertedValue, "with props", props, "and jobs", jobs);
      if (console.groupEnd) {
        console.groupEnd();
      }
    }
    return convertedValue;
  };
}

function validateModel(jobs) {
  return function validateState(value, props) {
    var immutableValue = (0, _immutable.fromJS)(value);
    var wholeValidation = jobs.reduceRight(function (red, job) {
      var outPath = job.out.split(".");
      var fieldValue = immutableValue.getIn(outPath);
      if (outPath.length === 1 && outPath[0] === "" && typeof job.validate === "function") throw new Error("You can't use validation if you don't have any out, either in the current node or a parent one. At " + job.in);
      var validation = typeof job.validate === "function" ? // $FlowFixMe
      job.validate(fieldValue, props) : true;
      if (validation === true || validation === null || validation === undefined) {
        return red;
      } else {
        return ((typeof red === "undefined" ? "undefined" : _typeof(red)) === "object" ? red : (0, _immutable.Map)()).setIn(outPath, validation);
      }
    }, true);

    if ((typeof wholeValidation === "undefined" ? "undefined" : _typeof(wholeValidation)) === "object") return wholeValidation.toJS();else return wholeValidation;
  };
}