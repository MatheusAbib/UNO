
import { Component, Output, EventEmitter } from '@angular/core';

type UnoColor = 'red' | 'green' | 'blue' | 'yellow';

@Component({
  selector: 'app-color-modal',
  standalone: true,
  templateUrl: './color-modal.html',
  styleUrls: ['./color-modal.css']
})
export class ColorModalComponent {
  @Output() colorSelected = new EventEmitter<UnoColor>();
  @Output() close = new EventEmitter<void>();

  selectColor(color: UnoColor): void {
    this.colorSelected.emit(color);
  }
}
