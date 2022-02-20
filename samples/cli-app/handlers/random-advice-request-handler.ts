import { createHandler } from "../deps.ts";
import { AdviceObject, API_URL } from "../advice-slip-api.ts";
import { AdviceReceivedNotification } from "../notifications/advice-received-notification.ts";
import { RandomAdviceRequest } from "../requests/random-advice-request.ts";

export const RandomAdviceRequestHandler = createHandler(
  RandomAdviceRequest,
  async () => {
    const res = await fetch(API_URL);
    const data: AdviceObject = await res.json();

    return new AdviceReceivedNotification(data.slip);
  },
);
