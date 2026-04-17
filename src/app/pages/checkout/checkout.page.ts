import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { WalletService } from '../../core/services/wallet.service';
import { TransactionService } from '../../core/services/transaction.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { PromptService } from '../../core/services/prompt.service';
import { FingerprintService } from '../../core/services/fingerprint.service';
import { AccountService } from '../../core/services/account.service';
import { AlertingService } from '../../core/services/alerting.service';
import { WalletCard } from '../../core/models/wallet-card.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: false,
})
export class CheckoutPage implements OnInit {
  private fb = inject(FormBuilder);
  private walletSvc = inject(WalletService);
  private txSvc = inject(TransactionService);
  private feedback = inject(FeedbackService);
  private spinner = inject(SpinnerService);
  private prompt = inject(PromptService);
  private fingerprint = inject(FingerprintService);
  private account = inject(AccountService);
  private alerting = inject(AlertingService);
  private router = inject(Router);

  cards$: Observable<WalletCard[]> = this.walletSvc.myCards$();
  chosenCard: WalletCard | null = null;

  form = this.fb.nonNullable.group({
    cardId: ['', Validators.required],
    storeName: ['', [Validators.required, Validators.minLength(2)]],
    chargedAmount: [0, [Validators.required, Validators.min(1000)]],
  });

  ngOnInit(): void {
    this.form.controls.cardId.valueChanges.subscribe((id) => {
      this.cards$.subscribe((cards) => {
        this.chosenCard = cards.find((c) => c.id === id) ?? null;
      }).unsubscribe();
    });
  }

  randomize(): void {
    const { storeName, chargedAmount } = TransactionService.generateSample();
    this.form.patchValue({ storeName, chargedAmount });
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cards = await firstValueFrom(this.cards$);
    const card = cards.find((c) => c.id === this.form.controls.cardId.value);
    if (!card) { await this.feedback.fail('Selecciona una tarjeta válida'); return; }

    const { storeName, chargedAmount } = this.form.getRawValue();

    const confirmed = await this.prompt.ask({
      title: 'Confirmar pago',
      body: `¿Pagar $${chargedAmount.toLocaleString('es-CO')} en ${storeName} con •••• ${card.lastDigits}?`,
      confirmLabel: 'Pagar ahora',
    });
    if (!confirmed) return;

    const user = this.account.currentUser;
    if (user) {
      const profile = await this.account.getAccountProfile(user.uid);
      if (profile?.biometricEnabled) {
        const ok = await this.fingerprint.authenticate('Autoriza tu pago');
        if (!ok) { await this.feedback.fail('Pago no autorizado'); return; }
      }
    }

    try {
      await this.spinner.run(() => this.txSvc.processPayment(card, storeName, chargedAmount), 'Procesando...');
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      await this.feedback.ok(`Pago exitoso en ${storeName}`);
      this.alerting.notifyPayment(storeName, chargedAmount).catch((e) => console.error('[Push]', e));
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: unknown) {
      Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      await this.feedback.fail((e as { message?: string })?.message ?? 'Error al procesar el pago');
    }
  }

  goBack(): void { this.router.navigateByUrl('/dashboard'); }
}
