import { Card } from './card';
import { Player } from './player';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  discardPile: Card[];
  drawPile: Card[];
  currentColor: string;
  currentValue: string | number;
  direction: 1 | -1;
  isGameOver: boolean;
  winner: Player | null;
  mustDraw: number;
  observers: string[];
}
