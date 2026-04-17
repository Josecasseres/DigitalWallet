import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NewCardPage } from './new-card.page';
import { NewCardPageRoutingModule } from './new-card-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, SharedModule, NewCardPageRoutingModule],
  declarations: [NewCardPage],
})
export class NewCardPageModule {}
