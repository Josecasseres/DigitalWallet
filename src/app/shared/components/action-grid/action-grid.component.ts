import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface GridAction {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-action-grid',
  templateUrl: './action-grid.component.html',
  styleUrls: ['./action-grid.component.scss'],
  standalone: false,
})
export class ActionGridComponent {
  @Input() actions: GridAction[] = [];
  @Output() actionSelected = new EventEmitter<string>();

  trackByKey(_: number, a: GridAction): string { return a.key; }
}
