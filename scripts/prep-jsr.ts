import denoConfig from "../src/deno.json" with { type: "json" };

const { name, ...denoConfigProperties } = denoConfig;

const versionOverride = Deno.args[0].substring("refs/tags/v".length);

// write deno.json
await Deno.writeTextFile(
  "./src/deno.json",
  JSON.stringify(
    {
      name,
      version: versionOverride,
      ...denoConfigProperties,
    },
    null,
    2,
  ),
);
