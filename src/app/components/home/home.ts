
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { RankingComponent } from '../ranking/ranking';
import { CrtTransitionService } from '../../services/crt-transition.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RankingComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  playerName: string = 'Mãe';
  botCount: number = 3;
  isLoading: boolean = false;
  showRanking: boolean = false;
  isTournamentMode: boolean = false;

  constructor(
    private gameService: GameService,
    private crtTransition: CrtTransitionService
  ) {}

  startGame(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const players = ['Mãe'];
    const botNames = ['Hanna', 'Lucia', 'Pedro'];

    for (let i = 0; i < this.botCount; i++) {
      players.push(botNames[i]);
    }

    this.gameService.initializeGame(players);
    this.crtTransition.navigate('/game');
  }

  startTournament(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.crtTransition.navigate('/tournament');
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
