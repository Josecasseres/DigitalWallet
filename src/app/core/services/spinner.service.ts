import { Injectable, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class SpinnerService {
  private ctrl = inject(LoadingController);
  private active: HTMLIonLoadingElement | null = null;

  async show(label = 'Un momento...'): Promise<void> {
    if (this.active) return;
    this.active = await this.ctrl.create({
      message: label,
      spinner: 'crescent',
      cssClass: 'dw-spinner',
    });
    await this.active.present();
  }

  async hide(): Promise<void> {
    if (this.active) {
      await this.active.dismiss();
      this.active = null;
    }
  }

  async run<T>(task: () => Promise<T>, label?: string): Promise<T> {
    await this.show(label);
    try { return await task(); }
    finally { await this.hide(); }
  }
}
