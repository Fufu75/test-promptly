/**
 * Service types - Business services offered
 * Matches config.json structure
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  enabled: boolean;
}
