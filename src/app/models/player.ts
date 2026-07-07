import { Card } from './card';

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isHuman: boolean;
  isUno: boolean;
  score: number;
}
