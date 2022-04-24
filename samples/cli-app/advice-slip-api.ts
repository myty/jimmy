// Constants
export const API_URL = "https://api.adviceslip.com/advice";

// Interfaces and Types
export interface AdviceObject {
  slip: {
    id: number;
    advice: string;
  };
}

export type Slip = AdviceObject["slip"];
