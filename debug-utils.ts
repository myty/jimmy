// deno-lint-ignore no-explicit-any
export function debug(...data: any[]) {
  const [arg1, ...args] = data;

  const message = (typeof arg1 === "string") ? ` ${arg1.trim()} ` : "";

  console.log("");
  console.log(`**************************${message}**************************`);
  console.log(...args);
  console.log(
    `**************************${
      new Array(message.length + 1).join("*")
    }**************************`,
  );
}
