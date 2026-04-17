import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MovementsPage } from './movements.page';
import { MovementsPageRoutingModule } from './movements-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule, IonicModule, SharedModule, MovementsPageRoutingModule],
  declarations: [MovementsPage],
})
export class MovementsPageModule {}
