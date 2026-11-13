import { Injectable } from '@angular/core';
import { Card } from '../models/card';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private suits = ['red', 'blue', 'green', 'yellow'];
  private values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2', 'swap', 'peek'];

  createDeck(): Card[] {
    const deck: Card[] = [];

this.suits.forEach(color => {
  this.values.forEach((value, index) => {
    const card: Card = {
      id: `${color}-${value}-${index}`,
      color: color as any,
      value: value,
      type: this.getCardType(value),
      isSpecial: this.isSpecialCard(value)
    };
    deck.push(card);

    if (value !== '0') {
      const maxCopies = (value === 'swap' || value === 'peek') ? 1 : 2;
      for (let i = 0; i < maxCopies; i++) {
        const card2: Card = {
          id: `${color}-${value}-${index}-copy-${i}`,
          color: color as any,
          value: value,
          type: this.getCardType(value),
          isSpecial: this.isSpecialCard(value)
        };
        deck.push(card2);
      }
    }
  });
});

    for (let i = 0; i < 4; i++) {
      const wildCard: Card = {
        id: `wild-${i}`,
        color: 'wild',
        value: 'wild',
        type: 'wild',
        isSpecial: true
      };
      deck.push(wildCard);

      const wildDrawFour: Card = {
        id: `wild-drawfour-${i}`,
        color: 'wild',
        value: 'wild_draw_four',
        type: 'wild',
        isSpecial: true
      };
      deck.push(wildDrawFour);
    }

    return this.shuffle(deck);
  }

  private getCardType(value: string): 'number' | 'action' | 'wild' {
    if (value === 'wild' || value === 'wild_draw_four') return 'wild';
    if (value === 'skip' || value === 'reverse' || value === 'draw2' || value === 'swap' || value === 'peek') return 'action';
    return 'number';
  }

  private isSpecialCard(value: string): boolean {
    const specials = ['skip', 'reverse', 'draw2', 'swap', 'peek'];
    return specials.includes(value);
  }

  shuffle(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  drawCards(deck: Card[], count: number): Card[] {
    return deck.splice(0, count);
  }

  addCards(deck: Card[], cards: Card[]): void {
    deck.push(...cards);
  }

  getTopCard(deck: Card[]): Card | null {
    return deck.length > 0 ? deck[deck.length - 1] : null;
  }
}
