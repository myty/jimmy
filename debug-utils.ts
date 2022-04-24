export const DEBUG_HEADING_PADDING = "**************************";

export function debug(...data: unknown[]) {
  const [arg1, ...args] = data;

  const message = (typeof arg1 === "string") ? ` ${arg1.trim()} ` : "";

  console.log("");
  console.log(`${DEBUG_HEADING_PADDING}${message}${DEBUG_HEADING_PADDING}`);
  console.log(...(typeof arg1 === "string" ? args : [arg1, ...args]));
  console.log(
    `${DEBUG_HEADING_PADDING}${
      new Array(message.length + 1).join("*")
    }${DEBUG_HEADING_PADDING}`,
  );
}
