import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { RankingComponent } from '../ranking/ranking';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RankingComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  // ✅ NOME FIXO
  playerName: string = 'Mãe';
  botCount: number = 3;
  isLoading: boolean = false;
  showRanking: boolean = false;
  isTournamentMode: boolean = false;

  constructor(
    private router: Router,
    private gameService: GameService
  ) {}

  startGame(): void {
    this.isLoading = true;
    const players = ['Mãe'];
    const botNames = ['Hanna', 'Lucia', 'Pedro'];
    for (let i = 0; i < this.botCount; i++) {
      players.push(botNames[i]);
    }

    this.gameService.initializeGame(players);
    setTimeout(() => {
      this.router.navigate(['/game']);
      this.isLoading = false;
    }, 500);
  }

  startTournament(): void {
    // ✅ NOME FIXO - SEM QUERY PARAMS
    this.router.navigate(['/tournament']);
  }

  changeBotCount(change: number): void {
    this.botCount = Math.max(1, Math.min(3, this.botCount + change));
  }

  openRanking(): void {
    this.showRanking = true;
  }

  closeRanking(): void {
    this.showRanking = false;
  }

  toggleTournamentMode(): void {
    this.isTournamentMode = !this.isTournamentMode;
  }
}
