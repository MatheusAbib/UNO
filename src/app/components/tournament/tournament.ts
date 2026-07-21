import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { TournamentService, TournamentState, TournamentHistory } from '../../services/tournament';
import { GameService } from '../../services/game.service';
import { RankingService } from '../../services/ranking';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './tournament.html',
  styleUrls: ['./tournament.css']
})
export class TournamentComponent implements OnInit, OnDestroy {
  tournamentState: TournamentState | null = null;
  private subscription: Subscription | null = null;
  private tournamentWinnerSub: Subscription | null = null;
  isStarting: boolean = false;
  playerName: string = 'Mãe';
  private isProcessing: boolean = false;
  tournamentHistory: TournamentHistory[] = [];
  showClearHistoryModal: boolean = false;

  constructor(
    private tournamentService: TournamentService,
    private gameService: GameService,
    private rankingService: RankingService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['playerName']) {
        this.playerName = params['playerName'];
      }
    });

    this.loadHistory();

    this.subscription = this.tournamentService.getTournamentState().subscribe((state: TournamentState | null) => {
      this.tournamentState = state;
      this.loadHistory();
    });

    this.tournamentWinnerSub = this.gameService.tournamentWinner$.subscribe(
      (data: { winnerName: string; position: string; eliminatedName?: string }) => {
        console.log('🔥🔥🔥 TOURNAMENT COMPONENT RECEBEU EVENTO!', data);

        if (this.isProcessing) return;
        this.isProcessing = true;

        console.log('🔴 Tournament Winner recebido:', data);
        console.log('🔴 Tournament State ANTES:', this.tournamentService.getTournamentStateValue());

        const tournamentState = this.tournamentService.getTournamentStateValue();

        if (tournamentState) {
          this.tournamentService.registerRoundResult(
            data.winnerName,
            data.eliminatedName || null,
            tournamentState.currentRound,
            `${data.winnerName} venceu a rodada`
          );

          console.log('🔴 Tournament State DEPOIS:', this.tournamentService.getTournamentStateValue());

          const nextPlayers = this.tournamentService.getNextMatchPlayers();
          console.log('🔴 nextPlayers:', nextPlayers);

          const activePlayers = tournamentState.players.filter(p => !p.eliminated);
          console.log('🔴 activePlayers:', activePlayers.map(p => p.name));

          if (activePlayers.length <= 1) {
            const champion = activePlayers[0];
            if (champion) {
              champion.position = 1;
              champion.group = 'champion';
              tournamentState.winner = champion;
              tournamentState.isActive = false;

              console.log('🏆 CAMPEÃO:', champion.name);

              this.tournamentService.saveTournamentHistory();
              this.loadHistory();

              const allPlayers = tournamentState.players.map(p => p.name);
              this.rankingService.updateRanking(allPlayers, champion.name);

              setTimeout(() => {
                this.router.navigate(['/tournament']);
              }, 3000);
            }
          } else {
            console.log('🔴 Iniciando próxima partida com:', nextPlayers);
            setTimeout(() => {
              this.startNextMatch(nextPlayers);
            }, 2000);
          }
        }

        setTimeout(() => {
          this.isProcessing = false;
        }, 1000);
      }
    );
  }

  ngOnDestroy(): void {
    console.log('🔴 TournamentComponent DESTRUÍDO');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.tournamentWinnerSub) {
      this.tournamentWinnerSub.unsubscribe();
    }
  }

  private startNextMatch(players: string[]): void {
    if (players.length < 2) {
      console.log('🔴 Menos de 2 jogadores, torneio finalizado');
      return;
    }

    console.log('🔴 startNextMatch com:', players);
    this.gameService.initializeGame(players, true);
    this.router.navigate(['/game']);
  }

  startTournament(): void {
    this.isStarting = true;
    const players = [this.playerName, 'Hanna', 'Lucia', 'Pedro'];
    this.tournamentService.initializeTournament(players);

    const state = this.tournamentService.getTournamentStateValue();
    if (state) {
      const nextPlayers = this.tournamentService.getNextMatchPlayers();
      console.log('🔴 Iniciando torneio com:', nextPlayers);
      this.gameService.initializeGame(nextPlayers, true);
      this.router.navigate(['/game']);
    }
    this.isStarting = false;
  }

  resetTournament(): void {
    this.tournamentService.resetTournament();
    this.router.navigate(['/']);
  }

  goHome(): void {
    this.tournamentService.resetTournament();
    this.router.navigate(['/']);
  }

startNextTournamentMatch(): void {
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) {
    this.router.navigate(['/']);
    return;
  }

  const nextPlayers = this.tournamentService.getNextMatchPlayers();
  const phase = tournamentState.currentPhase;

  console.log('🔴 startNextTournamentMatch:');
  console.log('  phase:', phase);
  console.log('  nextPlayers:', nextPlayers);

  if (phase === 4) {
    const activePlayers = nextPlayers;
    console.log('  activePlayers (FINAL):', activePlayers);

    if (activePlayers.length >= 2) {
      this.gameService.initializeGame(activePlayers, true);
      this.router.navigate(['/game']);
    } else {
      const champion = tournamentState.players.find(p => p.name === activePlayers[0]);
      if (champion) {
        champion.position = 1;
        champion.group = 'champion';
        tournamentState.winner = champion;
        tournamentState.isActive = false;
        console.log(`🏆 ${champion.name} É O CAMPEÃO DO TORNEIO!`);

        this.tournamentService.saveTournamentHistory();

        this.router.navigate(['/tournament']);
      }
    }
    return;
  }

  const observers = tournamentState.players
    .filter(p => p.group === 'winners' && !p.eliminated)
    .map(p => p.name);

  const shouldIncludeObservers = phase === 3;

  let activePlayers: string[];
  if (shouldIncludeObservers) {
    activePlayers = nextPlayers;
  } else {
    activePlayers = nextPlayers.filter(name => !observers.includes(name));
  }

  console.log('  activePlayers:', activePlayers);

  // ✅ ADICIONAR saveTournamentHistory() AQUI TAMBÉM
  if (activePlayers.length <= 1) {
    const champion = tournamentState.players.find(p => p.name === activePlayers[0]);
    if (champion) {
      champion.position = 1;
      champion.group = 'champion';
      tournamentState.winner = champion;
      tournamentState.isActive = false;
      console.log(`🏆 ${champion.name} É O CAMPEÃO DO TORNEIO!`);

      // ✅ SALVAR HISTÓRICO AQUI
      this.tournamentService.saveTournamentHistory();

      this.router.navigate(['/tournament']);
    }
    return;
  }

  if (activePlayers.length > 1) {
    this.gameService.initializeGame(activePlayers, true);
    this.router.navigate(['/game']);
  } else {
    this.router.navigate(['/']);
  }
}

// Adicione este método no TournamentComponent
getSortedHistoryPlayers(players: any[]): any[] {
  if (!players || players.length === 0) return [];

  return [...players].sort((a, b) => {
    if (a.position && b.position) {
      return a.position - b.position;
    }
    if (a.position && !b.position) return -1;
    if (!a.position && b.position) return 1;
    return 0;
  });
}

getTournamentStatusLabel(player: any): string {
  const tournamentState = this.tournamentService.getTournamentStateValue();
  if (!tournamentState) return 'JOGANDO';

  if (tournamentState.winner?.id === player.id) return 'CAMPEÃO';

  if (player.position === 2) return '2º LUGAR';

  if (player.eliminated) {
    if (player.position === 3) return '3º LUGAR';
    if (player.position === 4) return '4º LUGAR';
    return 'ELIMINADO';
  }

  const currentGameState = this.gameService.getCurrentGameState();
  const isCurrentlyPlaying = currentGameState?.players?.some((p: any) => p.name === player.name);
  if (isCurrentlyPlaying) return 'JOGANDO';

  if (player.group === 'winners' && !player.eliminated) return 'CLASSIFICADO';

  return 'AGUARDANDO';
}

  getSortedPlayers(): any[] {
    if (!this.tournamentState) return [];

    return [...this.tournamentState.players].sort((a, b) => {
      if (a.position && b.position) {
        return a.position - b.position;
      }

      if (a.position && !b.position) return -1;
      if (!a.position && b.position) return 1;

      if (!a.eliminated && b.eliminated) return -1;
      if (a.eliminated && !b.eliminated) return 1;

      return a.name.localeCompare(b.name);
    });
  }

  getRankStatusClass(player: any): string {
    if (player.eliminated) return 'status-eliminated';
    if (player.group === 'champion') return 'status-champion';
    if (player.group === 'winners' && !player.eliminated) return 'status-classified';
    return 'status-playing';
  }

  loadHistory(): void {
    this.tournamentHistory = this.tournamentService.getTournamentHistory();
    console.log('📜 Histórico carregado:', this.tournamentHistory.length, 'torneios');
    this.cdr.detectChanges();
  }

  getTournamentHistory(): TournamentHistory[] {
    return this.tournamentHistory;
  }

 clearHistory(): void {
    this.showClearHistoryModal = true;
  }

  confirmClearHistory(): void {
    this.tournamentService.clearTournamentHistory();
    this.loadHistory();
    this.showClearHistoryModal = false;
  }

  cancelClearHistory(): void {
    this.showClearHistoryModal = false;
  }
}
