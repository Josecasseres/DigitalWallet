import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SignUpPage } from './sign-up.page';
import { SignUpPageRoutingModule } from './sign-up-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, SignUpPageRoutingModule],
  declarations: [SignUpPage],
})
export class SignUpPageModule {}
