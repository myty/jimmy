const response = await fetch("https://github.com/myty/jimmy");
const body = await response.text();

const queue = body.split("<img ").map((line) => {
  const match = line.match(
    /^src="(https:\/\/camo\.githubusercontent\.com\/[a-f0-9]+\/[a-f0-9]+)" alt="([^"]+)"/,
  );
  if (match) {
    return { url: match[1], alt: match[2] };
  }
}).filter((
  line,
): line is { url: RegExpMatchArray[0]; alt: RegExpMatchArray[1] } => !!line);

Promise.allSettled(
  queue.map((obj) => {
    return fetch(obj.url, { method: "PURGE" }).then(() =>
      console.log("PURGE", obj.alt)
    ).catch((error) => {
      if (error) {
        console.error("Error: PURGE", obj.alt, error);
      }
    });
  }),
);
