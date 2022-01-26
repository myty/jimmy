import { Request } from "../request.ts";
import { Notification } from "../notification.ts";
import { Mediator } from "../mediator.ts";
import { parse } from "https://deno.land/std@0.61.0/flags/mod.ts";
import {
  format,
  fromUnixTime,
} from "https://deno.land/x/date_fns@v2.15.0/index.js";
import AsciiTable from "https://deno.land/x/ascii_table/mod.ts";

const apiKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

interface ForecastResult {
  city: string;
  days: string[][];
}

interface ForecastItem {
  dt: string;
  main: { temp: number };
  weather: { description: string }[];
}

class ForecastRequest extends Request<Promise<ForecastResult>> {
  constructor(public city: string) {
    super();
  }
}

class ForecastDisplayNotification extends Notification {
  constructor(public forecastResult: ForecastResult) {
    super();
  }
}

const mediator = new Mediator();

mediator.handle(ForecastRequest, async (req) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${req.city}&units=metric&appid=${apiKey}`,
  );

  const data = await res.json();
  const days = data.list.slice(0, 8).map((item: ForecastItem) => [
    format(fromUnixTime(item.dt), "do LLL, k:mm", {}),
    `${item.main.temp.toFixed(1)}C`,
    item.weather[0].description,
  ]);

  return {
    city: data.city.name,
    days,
  };
});

mediator.handle(ForecastDisplayNotification, (notification) => {
  const { forecastResult } = notification;

  const table = AsciiTable.fromJSON({
    title: `${forecastResult.city} Forecast`,
    heading: ["Time", "Temp", "Weather"],
    rows: forecastResult.days,
  });

  console.log(table.toString());

  return Promise.resolve();
});

const args = parse(Deno.args);

if (args.city === undefined) {
  console.error("No city supplied");
  Deno.exit();
}

const data = await mediator.send(new ForecastRequest(args.city));

await mediator.publish(new ForecastDisplayNotification(data));
