// deno run --allow-net ./samples/cli-advanced-app.ts

import { Request } from "../request.ts";
import { Notification } from "../notification.ts";
import { Mediator } from "../mediator.ts";
import { PublishStrategy } from "../publish-strategy.ts";

const randomDelayUpTo = (max: number, signal?: AbortSignal): Promise<void> => {
  let timoutId: number;

  signal?.addEventListener("abort", () => {
    clearTimeout(timoutId);
  });

  return new Promise((resolve) => {
    timoutId = setTimeout(() => resolve(), Math.random() * max);
  });
};

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

const mediator = new Mediator({
  publishStratey: PublishStrategy.ParallelNoWait,
});

mediator.handle(RandomAdviceRequest, async () => {
  const res = await fetch(`https://api.adviceslip.com/advice`);
  const data: AdviceObject = await res.json();

  return data.slip;
});

mediator.handle(AdviceReceivedNotification, async (notification, signal) => {
  await randomDelayUpTo(1000, signal);
  console.log(`Notification Handler #1: ${notification.slip.advice}`);
});

mediator.handle(AdviceReceivedNotification, async (notification, signal) => {
  await randomDelayUpTo(1000, signal);
  console.log(`Notification Handler #2: ${notification.slip.advice}`);
});

const slip = await mediator.send(new RandomAdviceRequest());

await mediator.publish(new AdviceReceivedNotification(slip));

// console.log(`Advice: ${slip.advice}`);
