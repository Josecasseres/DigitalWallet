import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movement } from '../../../core/models/movement.model';

@Component({
  selector: 'app-movement-list',
  templateUrl: './movement-list.component.html',
  styleUrls: ['./movement-list.component.scss'],
  standalone: false,
})
export class MovementListComponent {
  @Input() items: Movement[] = [];
  @Output() holdItem = new EventEmitter<Movement>();

  private holdTimer: ReturnType<typeof setTimeout> | null = null;

  startHold(item: Movement): void {
    this.holdTimer = setTimeout(() => this.holdItem.emit(item), 2000);
  }

  endHold(): void {
    if (this.holdTimer) { clearTimeout(this.holdTimer); this.holdTimer = null; }
  }

  trackById(_: number, m: Movement): string {
    return m.id ?? `${m.timestamp}-${m.storeName}`;
  }
}
