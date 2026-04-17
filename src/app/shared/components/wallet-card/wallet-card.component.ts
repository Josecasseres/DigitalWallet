import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, inject } from '@angular/core';
import { WalletCard } from '../../../core/models/wallet-card.model';

@Component({
  selector: 'app-wallet-card',
  templateUrl: './wallet-card.component.html',
  styleUrls: ['./wallet-card.component.scss'],
  standalone: false,
})
export class WalletCardComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) card!: WalletCard;
  @Input() showBalance = true;

  private el = inject(ElementRef);
  private zone = inject(NgZone);

  get expiryLabel(): string {
    const mm = String(this.card.expiryMonth).padStart(2, '0');
    const yy = String(this.card.expiryYear).padStart(2, '0').slice(-2);
    return `${mm}/${yy}`;
  }

  get networkLabel(): string {
    return this.card.network === 'visa' ? 'VISA'
      : this.card.network === 'mastercard' ? 'MASTERCARD' : '';
  }

  ngAfterViewInit(): void {
    const card = (this.el.nativeElement as HTMLElement).querySelector('.dw-card') as HTMLElement;
    if (!card) return;
    this.zone.runOutsideAngular(() => {
      card.addEventListener('mousemove', this.onMove);
      card.addEventListener('mouseleave', this.onLeave);
      card.addEventListener('touchmove', this.onTouch, { passive: true });
      card.addEventListener('touchend', this.onLeave);
    });
  }

  ngOnDestroy(): void {
    const card = (this.el.nativeElement as HTMLElement).querySelector('.dw-card') as HTMLElement;
    if (!card) return;
    card.removeEventListener('mousemove', this.onMove);
    card.removeEventListener('mouseleave', this.onLeave);
    card.removeEventListener('touchmove', this.onTouch);
    card.removeEventListener('touchend', this.onLeave);
  }

  private applyTilt(clientX: number, clientY: number): void {
    const card = (this.el.nativeElement as HTMLElement).querySelector('.dw-card') as HTMLElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateY = ((x - cx) / cx) * 14;
    const rotateX = -((y - cy) / cy) * 9;
    card.style.transition = 'transform .08s ease-out, box-shadow .08s ease-out';
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
    card.style.boxShadow = `
      ${-rotateY * 1.5}px ${rotateX * 1.5 + 28}px 55px -10px rgba(0,0,0,0.6),
      0 0 0 1px rgba(255,255,255,0.12),
      inset 0 1px 0 rgba(255,255,255,0.22)
    `;
    const shine = card.querySelector('.card-shine') as HTMLElement;
    if (shine) shine.style.backgroundPosition = `${(x / rect.width) * 120}% 0`;
  }

  private onMove = (e: MouseEvent): void => this.applyTilt(e.clientX, e.clientY);

  private onTouch = (e: TouchEvent): void => {
    if (e.touches[0]) this.applyTilt(e.touches[0].clientX, e.touches[0].clientY);
  };

  private onLeave = (): void => {
    const card = (this.el.nativeElement as HTMLElement).querySelector('.dw-card') as HTMLElement;
    if (!card) return;
    card.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s ease';
    card.style.transform = '';
    card.style.boxShadow = '';
    const shine = card.querySelector('.card-shine') as HTMLElement;
    if (shine) shine.style.backgroundPosition = '';
  };
}
