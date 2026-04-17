import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CheckoutPage } from './checkout.page';
import { CheckoutPageRoutingModule } from './checkout-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, SharedModule, CheckoutPageRoutingModule],
  declarations: [CheckoutPage],
})
export class CheckoutPageModule {}
