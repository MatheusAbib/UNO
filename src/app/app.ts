
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { CrtTransitionService } from './services/crt-transition.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class AppComponent implements OnDestroy {
  title = 'uno-game';

  transitionState: 'idle' | 'closing' | 'closed' | 'opening' = 'idle';

  private transitionSubscription: Subscription;
  private transitioning = false;

  constructor(
    private router: Router,
    private crtTransition: CrtTransitionService,
    private cdr: ChangeDetectorRef
  ) {
    this.transitionSubscription = this.crtTransition.transition$.subscribe(
      (url: string) => {
        if (this.transitioning) {
          return;
        }

        void this.navigateWithTransition(url);
      }
    );
  }

  private async navigateWithTransition(url: string): Promise<void> {
    this.transitioning = true;

    try {
      this.setTransitionState('closing');

      await this.wait(500);

      this.setTransitionState('closed');

      const navigation = this.router.navigateByUrl(url);

      navigation.catch((error) => {
        console.error('Erro na navegação:', error);
      });

      await Promise.race([
        navigation,
        this.wait(1500)
      ]);

      await this.wait(100);
    } catch (error) {
      console.error('Erro na transição CRT:', error);
    } finally {
      this.setTransitionState('opening');

      await this.wait(650);

      this.setTransitionState('idle');

      this.transitioning = false;
    }
  }

  private setTransitionState(
    state: 'idle' | 'closing' | 'closed' | 'opening'
  ): void {
    this.transitionState = state;
    this.cdr.detectChanges();
  }

  private wait(duration: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  ngOnDestroy(): void {
    this.transitionSubscription.unsubscribe();
  }
}
