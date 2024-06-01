// read contents of deno.json
const denoConfig = await Deno.readTextFile("./deno.json");

// parse deno.json
const { name, version, ...denoConfigObject } = JSON.parse(denoConfig);
const versionOverride = Deno.args[0].substring("refs/tags/v".length);

// write deno.json
await Deno.writeTextFile(
  "./deno.json",
  JSON.stringify(
    {
      name,
      version: versionOverride,
      ...denoConfigObject,
    },
    null,
    2,
  ),
);
