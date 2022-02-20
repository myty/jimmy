import { RandomAdviceRequestHandler } from "./random-advice-request-handler.ts";
import {
  AdviceReceivedNotificationHandler1,
  AdviceReceivedNotificationHandler2,
} from "./advice-received-notification-handler.ts";

export default [
  RandomAdviceRequestHandler,
  AdviceReceivedNotificationHandler1,
  AdviceReceivedNotificationHandler2,
];
