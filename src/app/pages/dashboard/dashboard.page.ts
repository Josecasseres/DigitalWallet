import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { PaymentSimulatorComponent } from '../../shared/components/payment-simulator/payment-simulator.component';
import { ThemeService } from '../../core/services/theme.service';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { WalletService } from '../../core/services/wallet.service';
import { TransactionService } from '../../core/services/transaction.service';
import { FingerprintService } from '../../core/services/fingerprint.service';
import { DatabaseService } from '../../core/services/database.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { AlertingService } from '../../core/services/alerting.service';
import { WalletCard } from '../../core/models/wallet-card.model';
import { Movement } from '../../core/models/movement.model';
import { GridAction } from '../../shared/components/action-grid/action-grid.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  private account = inject(AccountService);
  private wallet = inject(WalletService);
  private txSvc = inject(TransactionService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private fingerprint = inject(FingerprintService);
  private db = inject(DatabaseService);
  private feedback = inject(FeedbackService);
  private alerting = inject(AlertingService);
  private modalCtrl = inject(ModalController);
  readonly theme = inject(ThemeService);

  showBalance = true;
  biometricSupported = false;
  biometricActive = false;
  selectedCard: WalletCard | null = null;

  // Edit modal
  editingCard: WalletCard | null = null;
  editCardHolder = '';

  // Recharge modal
  rechargingCard: WalletCard | null = null;
  rechargeAmount = 0;
  quickAmounts = [50_000, 100_000, 200_000, 500_000];

  gridActions: GridAction[] = [
    { key: 'add', label: 'Agregar', icon: 'add-circle-outline' },
    { key: 'pay', label: 'Pagar', icon: 'arrow-up-circle-outline' },
    { key: 'history', label: 'Historial', icon: 'time-outline' },
    { key: 'simulate', label: 'Simular', icon: 'trending-up-outline' },
  ];

  cards$: Observable<WalletCard[]> = this.wallet.myCards$().pipe(
    tap((cards) => {
      if (cards.length === 0) {
        this.selectedCard = null;
      } else if (!this.selectedCard) {
        this.selectedCard = cards[0];
      } else {
        this.selectedCard = cards.find((c) => c.lastDigits === this.selectedCard?.lastDigits) ?? cards[0];
      }
    })
  );
  totalBalance$: Observable<number> = this.cards$.pipe(
    map((cards) => cards.reduce((sum, c) => sum + (c.availableBalance || 0), 0))
  );
  displayName$: Observable<string> = this.account.activeUser$.pipe(
    map((u) => u?.displayName || u?.email?.split('@')[0] || 'Usuario')
  );
  recentMovements$: Observable<Movement[]> = this.txSvc.movements$().pipe(
    map((items) => items.slice(0, 3))
  );

  async ngOnInit(): Promise<void> {
    this.biometricSupported = await this.fingerprint.supported();
    const user = this.account.currentUser;
    if (user) {
      const profile = await this.account.getAccountProfile(user.uid);
      this.biometricActive = !!profile?.biometricEnabled;
    }
    this.alerting.initialize().catch((e) => console.error('[Push]', e));
  }

  toggleBalance(): void { this.showBalance = !this.showBalance; }

  selectCard(card: WalletCard): void { this.selectedCard = card; }

  // ===== Edit Modal =====
  openEditModal(card: WalletCard): void {
    this.editingCard = card;
    this.editCardHolder = card.cardHolder;
  }

  closeEditModal(): void { this.editingCard = null; this.editCardHolder = ''; }

  async saveEdit(): Promise<void> {
    if (!this.editingCard?.id || !this.editCardHolder.trim()) return;
    try {
      await this.wallet.updateCard(this.editingCard.id, { cardHolder: this.editCardHolder.trim().toUpperCase() });
      await this.feedback.ok('Tarjeta actualizada');
      this.closeEditModal();
    } catch { await this.feedback.fail('No se pudo actualizar'); }
  }

  // ===== Recharge Modal =====
  openRechargeModal(card: WalletCard): void { this.rechargingCard = card; this.rechargeAmount = 0; }

  closeRechargeModal(): void { this.rechargingCard = null; this.rechargeAmount = 0; }

  async saveRecharge(): Promise<void> {
    if (!this.rechargingCard?.id || this.rechargeAmount <= 0) return;
    try {
      const newBalance = (this.rechargingCard.availableBalance || 0) + this.rechargeAmount;
      await this.wallet.updateCard(this.rechargingCard.id, { availableBalance: newBalance });
      await this.txSvc.recordDeposit(this.rechargingCard, 'Recarga manual', this.rechargeAmount);
      await this.feedback.ok(`Recarga de $${this.rechargeAmount.toLocaleString('es-CO')} exitosa`);
      this.closeRechargeModal();
    } catch { await this.feedback.fail('No se pudo recargar'); }
  }

  // ===== Delete =====
  async confirmRemoveCard(card: WalletCard): Promise<void> {
    if (!card.id) return;
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarjeta',
      message: `¿Deseas eliminar la tarjeta •••• ${card.lastDigits}?`,
      cssClass: 'dw-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.wallet.removeCard(card.id!);
            await this.feedback.ok('Tarjeta eliminada');
          },
        },
      ],
    });
    await alert.present();
  }

  async toggleBiometric(): Promise<void> {
    const user = this.account.currentUser;
    if (!user?.email) return;

    if (this.biometricActive) {
      await this.fingerprint.clearEntry();
      await this.db.patchDocument(`accounts/${user.uid}`, { biometricEnabled: false });
      this.biometricActive = false;
      await this.feedback.ok('Biometría desactivada');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Activar biometría',
      message: 'Ingresa tu contraseña para vincular tu huella o FaceID.',
      cssClass: 'dw-alert',
      inputs: [{ name: 'password', type: 'password', placeholder: 'Contraseña' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Activar',
          handler: async (data) => {
            const secret = (data?.password ?? '').trim();
            if (!secret) return false;
            try {
              await this.account.signIn(user.email!, secret);
              const ok = await this.fingerprint.authenticate('Vincula tu biometría');
              if (!ok) { await this.feedback.fail('Verificación cancelada'); return false; }
              await this.fingerprint.storeEntry({ username: user.email!, secret });
              await this.db.patchDocument(`accounts/${user.uid}`, { biometricEnabled: true });
              this.biometricActive = true;
              await this.feedback.ok('Biometría activada');
              return true;
            } catch {
              await this.feedback.fail('Contraseña incorrecta');
              return false;
            }
          },
        },
      ],
    });
    await alert.present();
  }

  onActionSelected(key: string): void {
    if (key === 'add') this.router.navigateByUrl('/new-card');
    else if (key === 'pay') this.router.navigateByUrl('/checkout');
    else if (key === 'history') this.router.navigateByUrl('/movements');
    else if (key === 'simulate') this.openDepositSimulator();
  }

  async openDepositSimulator(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PaymentSimulatorComponent,
      breakpoints: [0, 0.85],
      initialBreakpoint: 0.85,
    });
    await modal.present();
  }

  async logout(): Promise<void> {
    await this.account.signOut();
    await this.router.navigateByUrl('/sign-in', { replaceUrl: true });
  }

  trackById(_: number, c: WalletCard): string { return c.id ?? c.lastDigits; }
}
