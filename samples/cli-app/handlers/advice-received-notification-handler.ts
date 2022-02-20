import { createHandler } from "../deps.ts";
import { AdviceReceivedNotification } from "../notifications/advice-received-notification.ts";

export const AdviceReceivedNotificationHandler1 = createHandler(
  AdviceReceivedNotification,
  (notification) =>
    new Promise((resolve) => {
      const { advice } = notification.slip;
      const randomDelayMs = Math.floor(Math.random() * 1000);

      setTimeout(() => {
        console.log(`#1 advice received: ${advice}`);
        resolve();
      }, randomDelayMs);
    }),
);

export const AdviceReceivedNotificationHandler2 = createHandler(
  AdviceReceivedNotification,
  (notification) =>
    new Promise((resolve) => {
      const { advice } = notification.slip;
      const randomDelayMs = Math.floor(Math.random() * 1000);

      setTimeout(() => {
        console.log(`#2 advice received: ${advice}`);
        resolve();
      }, randomDelayMs);
    }),
);
