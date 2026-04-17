import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AccountService } from './account.service';
import { WalletCard } from '../models/wallet-card.model';
import { Movement } from '../models/movement.model';

const STORES = [
  'Amazon', 'Netflix', 'Spotify', 'Uber', 'Rappi', 'Starbucks',
  "McDonald's", 'Apple Store', 'Steam', 'Mercado Libre', 'Éxito', 'Carulla',
  'Falabella', 'Alkosto', 'Adidas', 'Zara', 'H&M', 'IKEA',
];

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private firestore = inject(Firestore);
  private account = inject(AccountService);

  static generateSample(): { storeName: string; chargedAmount: number } {
    const storeName = STORES[Math.floor(Math.random() * STORES.length)];
    const chargedAmount = Math.floor(Math.random() * 490_000) + 10_000;
    return { storeName, chargedAmount };
  }

  movements$(cardId?: string): Observable<Movement[]> {
    return this.account.activeUser$.pipe(
      switchMap((u) => {
        if (!u) return of([] as Movement[]);
        const ref = collection(this.firestore, `accounts/${u.uid}/movements`);
        const q = cardId
          ? query(ref, where('sourceCardId', '==', cardId), orderBy('timestamp', 'desc'))
          : query(ref, orderBy('timestamp', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Movement[]>;
      })
    );
  }

  async processPayment(card: WalletCard, storeName: string, chargedAmount: number): Promise<string> {
    const user = this.account.currentUser;
    if (!user || !card.id) throw new Error('Sesión inválida o tarjeta sin ID');
    if (chargedAmount <= 0) throw new Error('Monto inválido');

    const cardRef = doc(this.firestore, `accounts/${user.uid}/cards/${card.id}`);
    await runTransaction(this.firestore, async (tx) => {
      const snap = await tx.get(cardRef);
      if (!snap.exists()) throw new Error('Tarjeta no encontrada');
      const current = snap.data()['availableBalance'] as number;
      if (current < chargedAmount) throw new Error('Saldo insuficiente');
      tx.update(cardRef, { availableBalance: current - chargedAmount });
    });

    const movement: Omit<Movement, 'id'> = {
      sourceCardId: card.id,
      sourceLast4: card.lastDigits,
      storeName,
      chargedAmount,
      timestamp: Date.now(),
    };
    const ref = await addDoc(collection(this.firestore, `accounts/${user.uid}/movements`), movement);
    return ref.id;
  }

  async recordDeposit(card: WalletCard, concept: string, amount: number): Promise<string> {
    const user = this.account.currentUser;
    if (!user || !card.id) throw new Error('Sesión inválida');
    const movement: Omit<Movement, 'id'> = {
      sourceCardId: card.id,
      sourceLast4: card.lastDigits,
      storeName: concept,
      chargedAmount: amount,
      timestamp: Date.now(),
      type: 'deposit',
    };
    const ref = await addDoc(collection(this.firestore, `accounts/${user.uid}/movements`), movement);
    return ref.id;
  }

  async applyReaction(movementId: string, reaction: string): Promise<void> {
    const user = this.account.currentUser;
    if (!user) throw new Error('Sesión no activa');
    await updateDoc(doc(this.firestore, `accounts/${user.uid}/movements/${movementId}`), { reaction });
  }
}
