import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { WalletCardComponent } from './components/wallet-card/wallet-card.component';
import { MovementListComponent } from './components/movement-list/movement-list.component';
import { BalancePanelComponent } from './components/balance-panel/balance-panel.component';
import { ActionGridComponent } from './components/action-grid/action-grid.component';
import { ContentPlaceholderComponent } from './components/content-placeholder/content-placeholder.component';

const SHARED = [
  WalletCardComponent,
  MovementListComponent,
  BalancePanelComponent,
  ActionGridComponent,
  ContentPlaceholderComponent,
];

@NgModule({
  declarations: SHARED,
  imports: [CommonModule, IonicModule],
  exports: SHARED,
})
export class SharedModule {}
