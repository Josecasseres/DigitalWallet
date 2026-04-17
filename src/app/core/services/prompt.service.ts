import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';

export interface PromptOptions {
  title?: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PromptService {
  private alertCtrl = inject(AlertController);

  async ask(opts: PromptOptions): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: opts.title ?? 'Confirmación',
        message: opts.body,
        cssClass: opts.destructive ? 'dw-alert-danger' : 'dw-alert',
        buttons: [
          { text: opts.cancelLabel ?? 'Cancelar', role: 'cancel', handler: () => resolve(false) },
          { text: opts.confirmLabel ?? 'Aceptar', role: 'confirm', handler: () => resolve(true) },
        ],
      });
      await alert.present();
    });
  }

  async info(body: string, title = 'Aviso'): Promise<void> {
    const a = await this.alertCtrl.create({ header: title, message: body, buttons: ['OK'] });
    await a.present();
    await a.onDidDismiss();
  }
}
