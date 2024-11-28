import Profiler from '../src';
import * as fs from 'fs';

jest.mock("fs");

describe("Profiler", () => {
  const writeFileSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  afterAll(() => {
    jest.resetAllMocks();
  })
  it("should output empty array when no events are run", () => {
    const profile = new Profiler({ concurrency: 4 });
    profile.output();
    const writeFileCalledWith = writeFileSpy.mock.calls[0][1];
    expect(writeFileCalledWith).toBe("[]");
  })
  it("should output array with events when events are run", async () => {
    const profile = new Profiler({ concurrency: 4 });
    await profile.run(async () => {}, "test");
    profile.output();
    const writeFileCalledWith = JSON.parse(writeFileSpy.mock.calls[0][1].toString());
    expect(writeFileCalledWith.map(event => event.name)).toContain("test");
  })
  it("should output object with traceEvents and otherData when events and otherData are given", async () => {
    const profile = new Profiler({ concurrency: 4 });
    await profile.run(async () => {}, "test");
    profile.setOtherData("testKey", "testData");
    profile.output();
    const writeFileCalledWith = JSON.parse(writeFileSpy.mock.calls[0][1].toString());
    expect(writeFileCalledWith.traceEvents.map(event => event.name)).toContain("test");
    expect(writeFileCalledWith.otherData).toEqual({ "testKey": "testData" })
  })
})