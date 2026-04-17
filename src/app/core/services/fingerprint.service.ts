import { Injectable } from '@angular/core';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

const VAULT_KEY = 'digitalwallet.vault';

export interface VaultEntry {
  username: string;
  secret: string;
}

@Injectable({ providedIn: 'root' })
export class FingerprintService {
  get onDevice(): boolean {
    return Capacitor.isNativePlatform();
  }

  async supported(): Promise<boolean> {
    if (!this.onDevice) return false;
    try {
      const res = await NativeBiometric.isAvailable();
      return res.isAvailable && res.biometryType !== BiometryType.NONE;
    } catch { return false; }
  }

  async authenticate(prompt = 'Confirma tu identidad'): Promise<boolean> {
    if (!this.onDevice) return true;
    try {
      await NativeBiometric.verifyIdentity({
        reason: prompt,
        title: 'DigitalWallet',
        subtitle: prompt,
        description: 'Usa tu huella o reconocimiento facial',
      });
      return true;
    } catch { return false; }
  }

  async storeEntry(entry: VaultEntry): Promise<void> {
    if (!this.onDevice) return;
    await NativeBiometric.setCredentials({ username: entry.username, password: entry.secret, server: VAULT_KEY });
  }

  async retrieveEntry(): Promise<VaultEntry | null> {
    if (!this.onDevice) return null;
    try {
      const c = await NativeBiometric.getCredentials({ server: VAULT_KEY });
      return { username: c.username, secret: c.password };
    } catch { return null; }
  }

  async clearEntry(): Promise<void> {
    if (!this.onDevice) return;
    try { await NativeBiometric.deleteCredentials({ server: VAULT_KEY }); } catch { /* no-op */ }
  }
}
