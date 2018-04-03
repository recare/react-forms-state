import * as React from "react";
import { mount } from "enzyme";
import FormWatcher from "./FormWatcher";
import { INITIAL_CHANGE_EVENT_TYPE } from "./FormEvents";
import PropTypes from "prop-types";
import { Observable } from "rxjs/Observable";
import { of } from "rxjs/add/observable/of";

describe("FormWatcher", () => {
  class Context extends React.Component {
    getChildContext() {
      return {
        rootValueChangeObs: this.props.obs,
        statePath: "test",
        completeStatePath: "test",
      };
    }

    render() {
      return React.cloneElement(this.props.children);
    }
  }

  Context.childContextTypes = {
    rootValueChangeObs: PropTypes.any,
    statePath: PropTypes.any,
    completeStatePath: PropTypes.any,
  };

  it('should update when statePath is "infos" and watchPath "infos.name"', done => {
    const obs = Observable.of({
      statePath: "infos",
      value: "salut",
    });
    let spy = jest.fn(() => <div />);
    let subject = mount(
      <Context obs={obs}>
        <FormWatcher watchPath="infos.name">{spy}</FormWatcher>
      </Context>,
    );

    obs.subscribe(e => {
      expect(spy.mock).toMatchSnapshot();
      done();
    });
  });

  it("gives nested value in watchedValue", done => {
    const obs = Observable.of({
      statePath: "infos",
      value: {
        infos: {
          name: "ok",
        },
      },
    });
    let spy = jest.fn(() => <div />);
    let subject = mount(
      <Context obs={obs}>
        <FormWatcher watchPath="infos.name">{spy}</FormWatcher>
      </Context>,
    );

    obs.subscribe(e => {
      expect(spy.mock).toMatchSnapshot();
      done();
    });
  });

  it('should update when statePath is "infos.name" and watchPath "infos"', done => {
    const obs = Observable.of({
      statePath: "infos.name",
      value: "salut",
    });
    let spy = jest.fn(() => <div />);
    let subject = mount(
      <Context obs={obs}>
        <FormWatcher watchPath="infos">{spy}</FormWatcher>
      </Context>,
    );

    obs.subscribe(e => {
      expect(spy.mock).toMatchSnapshot();
      done();
    });
  });

  it('should not update when statePath is "infos.name" and watchPath "name"', done => {
    const obs = Observable.of({
      statePath: "infos.name",
      value: "salut",
    });
    let spy = jest.fn(() => <div />);
    let subject = mount(
      <Context obs={obs}>
        <FormWatcher watchPath="name">{spy}</FormWatcher>
      </Context>,
    );

    obs.subscribe(e => {
      expect(spy.mock).toMatchSnapshot();
      done();
    });
  });

  it("should throw if children isn't a function", () => {
    const obs = Observable.of({
      statePath: "infos.name",
      value: "salut",
    });
    expect(() =>
      mount(
        <Context obs={obs}>
          <FormWatcher watchPath="age">
            <div />
          </FormWatcher>
        </Context>,
      ),
    ).toThrowErrorMatchingSnapshot();
  });

  it("should accept a function as watchPath taking current statePath as parameter", done => {
    const obs = Observable.of({
      statePath: "infos",
      value: "salut",
    });
    let spy = jest.fn(() => <div />);
    let watchSpy = jest.fn(currentStatePath => `${currentStatePath}.newPath`);
    let subject = mount(
      <Context obs={obs}>
        <FormWatcher watchPath={watchSpy}>{spy}</FormWatcher>
      </Context>,
    );

    obs.subscribe(e => {
      expect(spy.mock).toMatchSnapshot();
      expect(watchSpy.mock).toMatchSnapshot();
      done();
    });
  });

  it("should handle initial change", done => {
    const obs = Observable.of({
      value: "salut",
      type: INITIAL_CHANGE_EVENT_TYPE,
    });
    let spy = jest.fn(() => <div />);
    let subject = mount(
      <Context obs={obs}>
        <FormWatcher watchPath="infos">{spy}</FormWatcher>
      </Context>,
    );

    obs.subscribe(e => {
      expect(spy.mock).toMatchSnapshot();
      done();
    });
  });
});
