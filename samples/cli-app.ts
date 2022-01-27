// deno run --allow-net ./samples/cli-app.ts

import { Request } from "../request.ts";
import { Notification } from "../notification.ts";
import { Mediator } from "../mediator.ts";

interface AdviceObject {
  slip: {
    id: number;
    advice: string;
  };
}

type Slip = AdviceObject["slip"];

class RandomAdviceRequest extends Request<Promise<Slip>> {}

class AdviceReceivedNotification extends Notification {
  constructor(public slip: Slip) {
    super();
  }
}

const mediator = new Mediator();

mediator.handle(RandomAdviceRequest, async () => {
  const res = await fetch(`https://api.adviceslip.com/advice`);
  const data: AdviceObject = await res.json();

  return data.slip;
});

mediator.handle(AdviceReceivedNotification, (notification) => {
  const { advice } = notification.slip;

  console.log(advice);

  return Promise.resolve();
});

const slip = await mediator.send(new RandomAdviceRequest());

await mediator.publish(new AdviceReceivedNotification(slip));
