import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { WalletCardComponent } from './components/wallet-card/wallet-card.component';
import { MovementListComponent } from './components/movement-list/movement-list.component';
import { BalancePanelComponent } from './components/balance-panel/balance-panel.component';
import { ActionGridComponent } from './components/action-grid/action-grid.component';
import { ContentPlaceholderComponent } from './components/content-placeholder/content-placeholder.component';
import { DateSelectorComponent } from './components/date-selector/date-selector.component';
import { PaymentSimulatorComponent } from './components/payment-simulator/payment-simulator.component';

const SHARED = [
  WalletCardComponent,
  MovementListComponent,
  BalancePanelComponent,
  ActionGridComponent,
  ContentPlaceholderComponent,
  DateSelectorComponent,
  PaymentSimulatorComponent,
];

@NgModule({
  declarations: SHARED,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  exports: SHARED,
})
export class SharedModule {}
