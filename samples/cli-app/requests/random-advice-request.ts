import { Request } from "../deps.ts";
import { AdviceReceivedNotification } from "../notifications/advice-received-notification.ts";

export class RandomAdviceRequest
  extends Request<Promise<AdviceReceivedNotification>> {}
