import { Slip } from "../advice-slip-api.ts";
import { Notification } from "../deps.ts";

export class AdviceReceivedNotification extends Notification {
  constructor(public slip: Slip) {
    super();
  }
}
