import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  playerName: string = 'Mãe';
  botCount: number = 3;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private gameService: GameService
  ) {}

  startGame(): void {
    this.isLoading = true;
    const players = [this.playerName || 'Mãe'];
    for (let i = 1; i <= this.botCount; i++) {
      players.push(`Bot ${i}`);
    }

    this.gameService.initializeGame(players);
    setTimeout(() => {
      this.router.navigate(['/game']);
      this.isLoading = false;
    }, 500);
  }

  changeBotCount(change: number): void {
    this.botCount = Math.max(1, Math.min(3, this.botCount + change));
  }
}
