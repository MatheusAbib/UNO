import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-modal.html',
  styleUrls: ['./color-modal.css']
})
export class ColorModalComponent {
  @Output() colorSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  selectColor(color: string): void {
    this.colorSelected.emit(color);
  }
}
