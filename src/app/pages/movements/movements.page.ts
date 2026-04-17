import { Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletService } from '../../core/services/wallet.service';
import { TransactionService } from '../../core/services/transaction.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { WalletCard } from '../../core/models/wallet-card.model';
import { Movement } from '../../core/models/movement.model';
import { Router } from '@angular/router';

const REACTION_SET = ['🍔', '🛒', '✈️', '🎬', '☕', '💸', '🎁', '⛽', '🏠', '❤️', '🎮', '🍕'];

@Component({
  selector: 'app-movements',
  templateUrl: './movements.page.html',
  styleUrls: ['./movements.page.scss'],
  standalone: false,
})
export class MovementsPage {
  private walletSvc = inject(WalletService);
  private txSvc = inject(TransactionService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  reactions = REACTION_SET;
  activeItem: Movement | null = null;
  chartBars: number[] = Array.from({ length: 14 }, () => 25 + Math.random() * 70);

  private cardFilter$ = new BehaviorSubject<string>('');
  private dateFilter$ = new BehaviorSubject<string>('');

  cards$: Observable<WalletCard[]> = this.walletSvc.myCards$();
  private allMovements$ = this.txSvc.movements$();

  filtered$: Observable<Movement[]> = combineLatest([this.allMovements$, this.cardFilter$, this.dateFilter$]).pipe(
    map(([items, cardId, dateIso]) => {
      let result = items;
      if (cardId) result = result.filter((m) => m.sourceCardId === cardId);
      if (dateIso) {
        const d = new Date(dateIso);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const end = start + 86_400_000;
        result = result.filter((m) => m.timestamp >= start && m.timestamp < end);
      }
      return result;
    })
  );

  totalSpent$: Observable<number> = this.filtered$.pipe(
    map((items) => items.reduce((acc, m) => acc + m.chargedAmount, 0))
  );

  onCardFilter(ev: CustomEvent): void { this.cardFilter$.next((ev.detail.value as string) ?? ''); }
  onDateFilter(ev: CustomEvent): void { this.dateFilter$.next((ev.detail.value as string) ?? ''); }
  resetFilters(): void { this.cardFilter$.next(''); this.dateFilter$.next(''); }

  openReactions(item: Movement): void { this.activeItem = item; }
  closeReactions(): void { this.activeItem = null; }

  async applyReaction(emoji: string): Promise<void> {
    if (!this.activeItem?.id) return;
    try {
      await this.txSvc.applyReaction(this.activeItem.id, emoji);
      await this.feedback.ok('Reacción guardada');
    } catch {
      await this.feedback.fail('No se pudo guardar la reacción');
    } finally { this.closeReactions(); }
  }

  goBack(): void { this.router.navigateByUrl('/dashboard'); }
}
