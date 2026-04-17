import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-balance-panel',
  templateUrl: './balance-panel.component.html',
  styleUrls: ['./balance-panel.component.scss'],
  standalone: false,
})
export class BalancePanelComponent {
  @Input() welcome = 'Bienvenido,';
  @Input() userName: string | null = '';
  @Input() totalBalance: number | null = 0;
  @Input() visible = true;
  @Output() toggleVisibility = new EventEmitter<void>();
}
