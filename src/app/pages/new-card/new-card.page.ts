import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { WalletCard, NetworkBrand } from '../../core/models/wallet-card.model';

@Component({
  selector: 'app-new-card',
  templateUrl: './new-card.page.html',
  styleUrls: ['./new-card.page.scss'],
  standalone: false,
})
export class NewCardPage {
  private fb = inject(FormBuilder);
  private walletSvc = inject(WalletService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  loading = false;
  detectedNetwork: NetworkBrand = 'unknown';

  form = this.fb.nonNullable.group({
    cardHolder: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required]],
    expiration: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  get cardPreview(): WalletCard {
    const digits = this.form.controls.cardNumber.value.replace(/\D/g, '');
    const exp = this.form.controls.expiration.value;
    const [mm, yy] = exp.includes('/') ? exp.split('/') : ['', ''];
    return {
      cardHolder: this.form.controls.cardHolder.value || 'NOMBRE APELLIDO',
      cardNumber: digits,
      lastDigits: digits.slice(-4).padStart(4, '•'),
      network: this.detectedNetwork,
      expiryMonth: parseInt(mm, 10) || 0,
      expiryYear: parseInt(yy, 10) || 0,
      availableBalance: 0,
      addedAt: 0,
    };
  }

  onNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const formatted = WalletService.formatCardNumber(target.value);
    this.form.controls.cardNumber.setValue(formatted, { emitEvent: false });
    target.value = formatted;
    this.detectedNetwork = WalletService.identifyNetwork(formatted);
  }

  onExpiryInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let v = target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    this.form.controls.expiration.setValue(v, { emitEvent: false });
    target.value = v;
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) { this.form.markAllAsTouched(); return; }
    const { cardHolder, cardNumber, expiration } = this.form.getRawValue();
    const [mm, yy] = expiration.split('/');
    this.loading = true;
    try {
      await this.walletSvc.registerCard({
        cardHolder,
        cardNumber,
        expiryMonth: parseInt(mm, 10),
        expiryYear: 2000 + parseInt(yy, 10),
      });
      await this.feedback.ok('Tarjeta registrada correctamente');
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? 'No se pudo registrar la tarjeta';
      await this.feedback.fail(msg);
    } finally { this.loading = false; }
  }

  goBack(): void { this.router.navigateByUrl('/dashboard'); }
}
