import { Notification } from "./notification.ts";
import { Request } from "./request.ts";
import {
  HandlerDefinition,
  NotificationHandler,
  RequestHandler,
} from "./types.ts";

export const createHandler = <T extends Request | Notification>(
  type: new (...args: unknown[]) => T,
  handle: T extends Request ? RequestHandler<T> : NotificationHandler<T>,
): HandlerDefinition => ({
  type,
  handle,
});
