// Prior art: https://github.com/lerna/lerna/blob/master/utils/profiler/profiler.js by @bweggersen

import fs from "fs";
import path from "path";
import { ProfilerEvent } from "./ProfilerEvent";

const hrtimeToMicroseconds = (hrtime) => {
  return (hrtime[0] * 1e9 + hrtime[1]) / 1000;
};

const range = (len) => {
  return Array(len)
    .fill(0)
    .map((_, idx) => idx);
};

const getTimeBasedFilename = (prefix: string) => {
  const now = new Date(); // 2011-10-05T14:48:00.000Z
  const datetime = now.toISOString().split(".")[0]; // 2011-10-05T14:48:00
  const datetimeNormalized = datetime.replace(/-|:/g, ""); // 20111005T144800
  return `${prefix ? prefix + "-" : ""}${datetimeNormalized}.json`;
};

export interface ProfilerOptions {
  concurrency: number;
  prefix: string;
  outDir: string;
  customOutputPath: string;
}

export default class Profiler {
  private events: ProfilerEvent[];
  private outputPath: string;
  private threads: number[];

  constructor(opts: ProfilerOptions) {
    const { concurrency, outDir, prefix, customOutputPath } = opts;

    this.events = [];
    this.outputPath =
      customOutputPath ||
      path.join(path.resolve(outDir || "."), getTimeBasedFilename(prefix));
    this.threads = range(concurrency);
  }

  run(fn: () => Promise<unknown>, name: string, cat?: string) {
    let startTime: [number, number];
    let threadId: number;

    return Promise.resolve()
      .then(() => {
        startTime = process.hrtime();
        threadId = this.threads.shift();
      })
      .then(() => fn())
      .then((value) => {
        const duration = process.hrtime(startTime);

        // Trace Event Format documentation:
        // https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview
        const event: ProfilerEvent = {
          name,
          cat,
          ph: "X",
          ts: hrtimeToMicroseconds(startTime),
          pid: 1,
          tid: threadId,
          dur: hrtimeToMicroseconds(duration),
        };

        this.events.push(event);

        this.threads.unshift(threadId);
        this.threads.sort();

        return value;
      });
  }

  /**
   * Writes out the profiler.json and returns the output path
   */
  output() {
    fs.writeFileSync(this.outputPath, JSON.stringify(this.events));
    return this.outputPath;
  }
}

module.exports = Profiler;
