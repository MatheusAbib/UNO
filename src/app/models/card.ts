export interface Card {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string | number;
  type: 'number' | 'action' | 'wild';
  isSpecial: boolean;
}
