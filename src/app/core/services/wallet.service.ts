import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AccountService } from './account.service';
import { WalletCard, NetworkBrand } from '../models/wallet-card.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private firestore = inject(Firestore);
  private account = inject(AccountService);

  static validateLuhn(raw: string): boolean {
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 12 || digits.length > 19) return false;
    let sum = 0;
    let flip = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (flip) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      flip = !flip;
    }
    return sum % 10 === 0 && sum > 0;
  }

  static identifyNetwork(raw: string): NetworkBrand {
    const d = raw.replace(/\D/g, '');
    if (!d) return 'unknown';
    if (d.startsWith('4')) return 'visa';
    const two = parseInt(d.slice(0, 2), 10);
    if (two >= 51 && two <= 55) return 'mastercard';
    const four = parseInt(d.slice(0, 4), 10);
    if (four >= 2221 && four <= 2720) return 'mastercard';
    return 'unknown';
  }

  static formatCardNumber(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  }

  myCards$(): Observable<WalletCard[]> {
    return this.account.activeUser$.pipe(
      switchMap((u) => {
        if (!u) return of([] as WalletCard[]);
        const ref = collection(this.firestore, `accounts/${u.uid}/cards`);
        return collectionData(query(ref, orderBy('addedAt', 'desc')), { idField: 'id' }) as Observable<WalletCard[]>;
      })
    );
  }

  async registerCard(input: { cardHolder: string; cardNumber: string; expiryMonth: number; expiryYear: number }): Promise<string> {
    const user = this.account.currentUser;
    if (!user) throw new Error('Sesión no activa');
    const digits = input.cardNumber.replace(/\D/g, '');
    if (!WalletService.validateLuhn(digits)) throw new Error('Número de tarjeta inválido (Luhn)');
    const network = WalletService.identifyNetwork(digits);
    if (network === 'unknown') throw new Error('Solo se aceptan Visa o Mastercard');

    const card: Omit<WalletCard, 'id'> = {
      cardHolder: input.cardHolder.trim().toUpperCase(),
      cardNumber: digits,
      lastDigits: digits.slice(-4),
      network,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
      availableBalance: Math.floor(Math.random() * 9_000_000) + 1_000_000,
      addedAt: Date.now(),
    };
    const ref = await addDoc(collection(this.firestore, `accounts/${user.uid}/cards`), card);
    return ref.id;
  }

  async updateCard(cardId: string, data: Partial<WalletCard>): Promise<void> {
    const user = this.account.currentUser;
    if (!user) throw new Error('Sesión no activa');
    await updateDoc(doc(this.firestore, `accounts/${user.uid}/cards/${cardId}`), data as Record<string, unknown>);
  }

  async removeCard(cardId: string): Promise<void> {
    const user = this.account.currentUser;
    if (!user) throw new Error('Sesión no activa');
    await deleteDoc(doc(this.firestore, `accounts/${user.uid}/cards/${cardId}`));
  }
}
