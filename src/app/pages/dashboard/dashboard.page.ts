import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { WalletService } from '../../core/services/wallet.service';
import { FingerprintService } from '../../core/services/fingerprint.service';
import { DatabaseService } from '../../core/services/database.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { AlertingService } from '../../core/services/alerting.service';
import { WalletCard } from '../../core/models/wallet-card.model';
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
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private fingerprint = inject(FingerprintService);
  private db = inject(DatabaseService);
  private feedback = inject(FeedbackService);
  private alerting = inject(AlertingService);

  showBalance = true;
  biometricSupported = false;
  biometricActive = false;

  gridActions: GridAction[] = [
    { key: 'add', label: 'Agregar', icon: 'add-circle-outline' },
    { key: 'pay', label: 'Pagar', icon: 'arrow-up-circle-outline' },
    { key: 'history', label: 'Historial', icon: 'time-outline' },
  ];

  cards$: Observable<WalletCard[]> = this.wallet.myCards$();
  totalBalance$: Observable<number> = this.cards$.pipe(
    map((cards) => cards.reduce((sum, c) => sum + (c.availableBalance || 0), 0))
  );
  displayName$: Observable<string> = this.account.activeUser$.pipe(
    map((u) => u?.displayName || u?.email?.split('@')[0] || 'Usuario')
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
  }

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

  async logout(): Promise<void> {
    await this.account.signOut();
    await this.router.navigateByUrl('/sign-in', { replaceUrl: true });
  }

  trackById(_: number, c: WalletCard): string { return c.id ?? c.lastDigits; }
}
