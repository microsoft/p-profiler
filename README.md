# p-profiler

Run a promise (perhaps with p-queue) generating a profiler json suitable to be consumed inside Chrome or Edge devtools to be analyzed

## Install

```
$ npm install p-profiler
```

## Usage

The p-profiler library is a class. Simply instantiate a `Profiler` class to be used to run the task functions (functions that generate a Promise). This example uses `p-graph` to demonstrate how to use this library. The task functions in this example is wrapped inside a profiler and a promise queue to control concurrency

```js
import Profiler from "p-profiler";
import pGraph from "p-graph";
import PQueue from "p-queue";

const concurrency = 3;

// Create a profiler with the same concurrency as the p-graph
const profiler = new Profiler({ concurrency });
const queue = new PQueue({ concurrency });

const putOnShirt = () =>
  queue.add(profiler.run(() => Promise.resolve("put on your shirt")));
const putOnShorts = () =>
  queue.add(profiler.run(() => Promise.resolve("put on your shorts")));
const putOnJacket = () =>
  queue.add(profiler.run(() => Promise.resolve("put on your jacket")));
const putOnShoes = () =>
  queue.add(profiler.run(() => Promise.resolve("put on your shoes")));
const tieShoes = () =>
  queue.add(profiler.run(() => Promise.resolve("tie your shoes")));

const graph = [
  [putOnShoes, tieShoes],
  [putOnShirt, putOnJacket],
  [putOnShorts, putOnJacket],
  [putOnShorts, putOnShoes],
];

await pGraph(graph).run(); // returns a promise that will resolve when all the tasks are done from this graph in order

// This writes out a
profiler.output();
```

You can also add any arbitrary key-value data to the profile json, using the function `setOtherData`. This can be useful in cases where you want to analyze the profile and need more information than what is available in the profile by default.

```js
const profiler = new Profiler({ concurrency });
// Add events

profiler.setOtherData("taskGraph", ["putOnShoes", "tieShoes"])
```
The profile json format is described [here](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview). If you haven't used `setOtherData` then json is array of events, otherwise it's an object with `traceEvents` and `otherData` properties.

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
