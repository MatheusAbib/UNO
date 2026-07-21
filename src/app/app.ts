import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  // styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'uno-game';

  ngOnInit(): void {
    setTimeout(() => {
      this.createFloatingCards();
      this.createParticles();
    }, 100);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const cursor = document.getElementById('customCursor');
    if (cursor) {
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';
    }
  }

  createFloatingCards(): void {
    const container = document.getElementById('floating-cards');
    if (!container) return;

    const colors = ['#ff2a6d', '#05d9e8', '#00ff9d', '#f9f002', '#d300c5'];
    const positions = [
      { top: '5%', left: '3%', delay: '0s' },
      { top: '20%', left: '85%', delay: '2s' },
      { top: '50%', left: '5%', delay: '4s' },
      { top: '70%', left: '90%', delay: '6s' },
      { top: '85%', left: '10%', delay: '8s' },
      { top: '40%', left: '50%', delay: '3s' },
      { top: '10%', left: '50%', delay: '5s' },
      { top: '90%', left: '50%', delay: '7s' },
      { top: '60%', left: '30%', delay: '1s' },
      { top: '30%', left: '70%', delay: '9s' }
    ];

    positions.forEach((pos, index) => {
      const card = document.createElement('div');
      card.className = 'floating-card';
      card.style.top = pos.top;
      card.style.left = pos.left;
      card.style.animationDelay = pos.delay;
      card.style.background = colors[index % colors.length];
      container.appendChild(card);
    });
  }

  createParticles(): void {
    const neonParticles = document.getElementById('neon-particles');
    const colorfulDots = document.getElementById('colorful-dots');

    if (neonParticles) {
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('span');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = 5 + Math.random() * 10 + 's';

        const colors = ['var(--neon-red)', 'var(--neon-blue)', 'var(--neon-green)', 'var(--neon-yellow)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.boxShadow = '0 0 10px currentColor, 0 0 20px currentColor';

        neonParticles.appendChild(particle);
      }
    }

    if (colorfulDots) {
      const dotColors = [
        'rgba(255, 42, 109, 0.5)',
        'rgba(5, 217, 232, 0.5)',
        'rgba(0, 255, 157, 0.5)',
        'rgba(249, 240, 2, 0.5)',
        'rgba(211, 0, 197, 0.5)'
      ];

      for (let i = 0; i < 30; i++) {
        const dot = document.createElement('span');
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.animationDelay = Math.random() * 4 + 's';
        dot.style.background = dotColors[Math.floor(Math.random() * dotColors.length)];

        colorfulDots.appendChild(dot);
      }
    }
  }
}
