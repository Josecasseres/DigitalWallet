import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AccountService } from './account.service';
import { DatabaseService } from './database.service';
import { ApiService } from './api.service';
import { FeedbackService } from './feedback.service';
import { PromptService } from './prompt.service';

@Injectable({ providedIn: 'root' })
export class AlertingService {
  private account = inject(AccountService);
  private db = inject(DatabaseService);
  private api = inject(ApiService);
  private feedback = inject(FeedbackService);
  private prompt = inject(PromptService);
  private deviceToken: string | null = null;
  private initialized = false;

  get isNative(): boolean { return Capacitor.isNativePlatform(); }

  async initialize(): Promise<void> {
    if (!this.isNative || this.initialized) return;
    this.initialized = true;

    const perm = await PushNotifications.checkPermissions();
    let status = perm.receive;
    if (status === 'prompt' || status === 'prompt-with-rationale') {
      status = (await PushNotifications.requestPermissions()).receive;
    }
    if (status !== 'granted') return;

    PushNotifications.addListener('registration', async (token: Token) => {
      this.deviceToken = token.value;
      const user = this.account.currentUser;
      if (user) await this.db.patchDocument(`accounts/${user.uid}`, { fcmToken: token.value });
    });

    PushNotifications.addListener('registrationError', (e) => console.error('[Push]', e));

    PushNotifications.addListener('pushNotificationReceived', async (n: PushNotificationSchema) => {
      const title = n.title ?? 'DigitalWallet';
      const body = n.body ?? '';
      this.feedback.ok(`${title}: ${body}`).catch(() => {});
      try {
        await LocalNotifications.schedule({
          notifications: [{ id: Math.floor(Math.random() * 100000), title, body, channelId: 'dw-main' }],
        });
      } catch (e) { console.warn('[Push] local notif error', e); }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', async (a: ActionPerformed) => {
      await this.prompt.info(a.notification.body ?? '', a.notification.title ?? 'DigitalWallet');
    });

    try {
      const lp = await LocalNotifications.checkPermissions();
      if (lp.display !== 'granted') await LocalNotifications.requestPermissions();
      await LocalNotifications.createChannel({
        id: 'dw-main', name: 'Pagos', description: 'Notificaciones de transacciones',
        importance: 5, visibility: 1, sound: 'default', vibration: true,
      });
    } catch (e) { console.warn('[Push] local setup', e); }

    await PushNotifications.register();
  }

  async notifyPayment(storeName: string, chargedAmount: number): Promise<void> {
    const user = this.account.currentUser;
    if (!user) return;
    const profile = await this.db.fetchDocument<{ fcmToken?: string }>(`accounts/${user.uid}`);
    const token = profile?.fcmToken ?? this.deviceToken;
    if (!token) return;
    const title = 'Pago procesado';
    const body = `Pagaste $${chargedAmount.toLocaleString('es-CO')} en ${storeName}`;
    await this.api.sendPush({
      token,
      notification: { title, body },
      android: { priority: 'high', data: { title, body, type: 'payment', uid: user.uid } },
    });
  }
}
