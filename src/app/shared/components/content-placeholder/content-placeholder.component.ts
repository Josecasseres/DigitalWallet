import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-content-placeholder',
  templateUrl: './content-placeholder.component.html',
  styleUrls: ['./content-placeholder.component.scss'],
  standalone: false,
})
export class ContentPlaceholderComponent {
  @Input() variant: 'card' | 'row' | 'line' = 'card';
  @Input() count = 3;
  get rows(): number[] { return Array.from({ length: this.count }, (_, i) => i); }
}
