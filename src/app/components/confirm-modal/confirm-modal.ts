import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-modal-overlay" (click)="onCancel()">
      <div class="confirm-modal-content" (click)="$event.stopPropagation()">
        <div class="confirm-modal-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h2 class="confirm-modal-title">{{ title }}</h2>
        <p class="confirm-modal-message">{{ message }}</p>
        <div class="confirm-modal-buttons">
          <button class="confirm-btn cancel" (click)="onCancel()">
            <i class="pi pi-times"></i> CANCELAR
          </button>
          <button class="confirm-btn confirm" (click)="onConfirm()">
            <i class="pi pi-check"></i> CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: modal-fade-in 0.3s ease;
    }

    @keyframes modal-fade-in {
      0% {
        opacity: 0;
        transform: scale(0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .confirm-modal-content {
      background: rgba(13, 2, 33, 0.95);
      padding: 35px 40px 30px;
      border-radius: 20px;
      border: 2px solid var(--neon-red);
      box-shadow: 0 0 60px rgba(255, 42, 109, 0.3);
      max-width: 450px;
      width: 90%;
      text-align: center;
    }

    .confirm-modal-icon {
      font-size: 3rem;
      color: var(--neon-red);
      margin-bottom: 15px;
      text-shadow: 0 0 30px var(--neon-red);
    }

    .confirm-modal-title {
      font-family: 'Press Start 2P', cursive;
      font-size: 1rem;
      color: white;
      margin-bottom: 12px;
    }

    .confirm-modal-message {
      font-family: 'Press Start 2P', cursive;
      font-size: 0.6rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin-bottom: 25px;
    }

    .confirm-modal-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .confirm-btn {
      font-family: 'Press Start 2P', cursive;
      font-size: 0.6rem;
      padding: 10px 20px;
      border-radius: 10px;
      border: 2px solid;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
    }

    .confirm-btn i{
      font-size: 1rem;
    }

    .confirm-btn.cancel {
      background: transparent;
      color: var(--neon-red);
      border-color: var(--neon-red);
    }

    .confirm-btn.cancel:hover {
      background: var(--neon-red);
      color: var(--dark-bg);
      box-shadow: 0 0 20px var(--neon-red);
      transform: scale(1.05);
    }

    .confirm-btn.confirm {
      background: transparent;
      color: var(--neon-green);
      border-color: var(--neon-green);
    }

    .confirm-btn.confirm:hover {
      background: var(--neon-green);
      color: var(--dark-bg);
      box-shadow: 0 0 20px var(--neon-green);
      transform: scale(1.05);
    }

    @media (max-width: 500px) {
      .confirm-modal-content {
        padding: 25px 20px;
      }

      .confirm-modal-title {
        font-size: 0.8rem;
      }

      .confirm-modal-message {
        font-size: 0.5rem;
      }

      .confirm-btn {
        font-size: 0.4rem;
        padding: 8px 14px;
      }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() title: string = 'CONFIRMAR';
  @Input() message: string = 'Tem certeza que deseja continuar?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
