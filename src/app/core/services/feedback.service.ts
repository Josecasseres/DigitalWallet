import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

export type FeedbackLevel = 'success' | 'danger' | 'warning' | 'primary';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private toastCtrl = inject(ToastController);

  async notify(text: string, level: FeedbackLevel = 'primary', ms = 2200): Promise<void> {
    const t = await this.toastCtrl.create({
      message: text,
      duration: ms,
      color: level,
      position: 'top',
      cssClass: 'dw-toast',
      buttons: [{ text: '✕', role: 'cancel' }],
    });
    await t.present();
  }

  ok(text: string) { return this.notify(text, 'success'); }
  fail(text: string) { return this.notify(text, 'danger', 3000); }
  warn(text: string) { return this.notify(text, 'warning'); }
}
