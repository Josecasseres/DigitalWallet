import { Component, Input } from '@angular/core';
import { WalletCard } from '../../../core/models/wallet-card.model';

@Component({
  selector: 'app-wallet-card',
  templateUrl: './wallet-card.component.html',
  styleUrls: ['./wallet-card.component.scss'],
  standalone: false,
})
export class WalletCardComponent {
  @Input({ required: true }) card!: WalletCard;
  @Input() showBalance = true;

  get expiryLabel(): string {
    const mm = String(this.card.expiryMonth).padStart(2, '0');
    const yy = String(this.card.expiryYear).padStart(2, '0').slice(-2);
    return `${mm}/${yy}`;
  }

  get networkLabel(): string {
    return this.card.network === 'visa' ? 'VISA'
      : this.card.network === 'mastercard' ? 'MASTERCARD' : '';
  }
}
