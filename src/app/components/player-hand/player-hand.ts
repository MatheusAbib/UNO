import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../models/player';
import { Card } from '../../models/card';

@Component({
  selector: 'app-player-hand',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-hand.html',
  styleUrls: ['./player-hand.css']
})
export class PlayerHandComponent {
  @Input() player: Player | null = null;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Input() isCurrent: boolean = false;
  @Input() isHuman: boolean = false;
  @Input() speechMessage: string = '';
  @Output() cardPlayed = new EventEmitter<number>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.cdr.detectChanges();
  }

  getAvatarImage(name: string): string {
    const avatars: {[key: string]: string} = {
      'Hanna': 'avatars/hanna.webp',
      'Lucia': 'avatars/lucy.avif',
      'Pedro': 'avatars/pedro.jpg'
    };
    return avatars[name] || '';
  }

  getAvatarInitial(name: string): string {
    if (name === 'Hanna') return 'H';
    if (name === 'Lucia') return 'L';
    if (name === 'Pedro') return 'P';
    return name.charAt(0).toUpperCase();
  }

  hasImage(name: string): boolean {
    return name === 'Hanna' || name === 'Lucia' || name === 'Pedro';
  }

  getAvatarColor(name: string): string {
    const colors: {[key: string]: string} = {
      'Hanna': 'linear-gradient(135deg, #05d9e8, #00a2ff)',
      'Lucia': 'linear-gradient(135deg, #00ff9d, #00cc7a)',
      'Pedro': 'linear-gradient(135deg, #f9f002, #ffcc00)'
    };
    return colors[name] || 'linear-gradient(135deg, #ff2a6d, #ff0040)';
  }

  getCardColor(card: Card): string {
    if (card.color === 'wild') return 'var(--neon-purple)';
    const colors: {[key: string]: string} = {
      'red': 'var(--neon-red)',
      'blue': 'var(--neon-blue)',
      'green': 'var(--neon-green)',
      'yellow': 'var(--neon-yellow)'
    };
    return colors[card.color] || 'white';
  }

  getCardDisplay(card: Card): string {
    if (card.value === 'skip') return '⊘';
    if (card.value === 'reverse') return '⟳';
    if (card.value === 'draw2') return '+2';
    if (card.value === 'wild') return '★';
    if (card.value === 'wild_draw_four') return '+4';
    return card.value.toString();
  }

  getCardTransform(index: number, total: number): string {
    if (this.isHuman) return '';

    const maxAngle = 25;
    const center = (total - 1) / 2;
    const angle = ((index - center) / center) * maxAngle;
    const translateY = Math.abs(index - center) * 8;

    if (this.position === 'top') {
      return `rotate(${angle}deg) translateY(${translateY}px)`;
    } else if (this.position === 'bottom') {
      return `rotate(${angle}deg) translateY(${-translateY}px)`;
    } else if (this.position === 'left') {
      return `rotate(${angle}deg) translateX(${translateY}px)`;
    } else if (this.position === 'right') {
      return `rotate(${angle}deg) translateX(${-translateY}px)`;
    }
    return '';
  }

  playCard(index: number): void {
    if (this.isHuman && this.isCurrent) {
      this.cardPlayed.emit(index);
    }
  }

  showSpeech(): boolean {
    return !this.isHuman && !!this.speechMessage;
  }
}
