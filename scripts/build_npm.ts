#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env --allow-run
// Copyright 2018-2022 the oak authors. All rights reserved. MIT license.

/**
 * This is the build script for building the oak framework into a Node.js
 * compatible npm package.
 *
 * @module
 */

import { build, emptyDir } from "@deno/dnt";

async function start() {
  await emptyDir("./npm");

  await build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    shims: {
      deno: true,
      timers: true,
    },
    test: true,
    compilerOptions: {
      importHelpers: true,
      target: "ES2021",
    },
    package: {
      name: "@myty/jimmy",
      version: Deno.args[0].substring("refs/tags/v".length),
      description: "A simple mediator for both Deno and Node.js",
      license: "MIT",
      author: "Michael Tyson",
      repository: {
        type: "git",
        url: "git+https://github.com/myty/jimmy.git",
      },
      bugs: {
        url: "https://github.com/myty/jimmy/issues",
      },
      homepage: "https://github.com/myty/jimmy#readme",
    },
  });

  await Deno.copyFile("LICENSE", "npm/LICENSE");
  await Deno.copyFile("README.md", "npm/README.md");
}

start();
