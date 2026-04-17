import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Observable, firstValueFrom } from 'rxjs';
import { WalletService } from '../../../core/services/wallet.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { WalletCard } from '../../../core/models/wallet-card.model';

const DEPOSIT_CONCEPTS = ['Nómina', 'Transferencia', 'Freelance', 'Venta', 'Bono', 'Devolución', 'Comisión', 'Premio'];

@Component({
  selector: 'app-payment-simulator',
  templateUrl: './payment-simulator.component.html',
  standalone: false,
})
export class PaymentSimulatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private walletSvc = inject(WalletService);
  private txSvc = inject(TransactionService);
  private feedback = inject(FeedbackService);

  availableCards$: Observable<WalletCard[]> = this.walletSvc.myCards$();
  processing = false;

  form = this.fb.nonNullable.group({
    cardId: ['', Validators.required],
    concept: ['', Validators.required],
    depositAmount: [0, [Validators.required, Validators.min(1000)]],
  });

  ngOnInit(): void {
    this.randomize();
  }

  randomize(): void {
    const concept = DEPOSIT_CONCEPTS[Math.floor(Math.random() * DEPOSIT_CONCEPTS.length)];
    const depositAmount = Math.floor(Math.random() * 490_000) + 10_000;
    this.form.patchValue({ concept, depositAmount });
  }

  async confirm(): Promise<void> {
    if (this.form.invalid || this.processing) { this.form.markAllAsTouched(); return; }
    this.processing = true;
    const { cardId, depositAmount, concept } = this.form.getRawValue();
    try {
      const cards = await firstValueFrom(this.availableCards$);
      const card = cards.find((c) => c.id === cardId);
      if (!card) throw new Error('Tarjeta no encontrada');
      await this.walletSvc.updateCard(cardId, { availableBalance: (card.availableBalance || 0) + depositAmount });
      await this.txSvc.recordDeposit(card, concept, depositAmount);
      await this.feedback.ok(`+$${depositAmount.toLocaleString('es-CO')} por "${concept}" acreditados`);
      this.modalCtrl.dismiss(null, 'confirm');
    } catch (e: unknown) {
      await this.feedback.fail((e as { message?: string })?.message ?? 'Error al simular ingreso');
    } finally {
      this.processing = false;
    }
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
