import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { autoLoginGuard } from './core/guards/auto-login.guard';

const routes: Routes = [
  {
    path: 'sign-in',
    canActivate: [autoLoginGuard],
    loadChildren: () => import('./pages/sign-in/sign-in.module').then((m) => m.SignInPageModule),
  },
  {
    path: 'sign-up',
    canActivate: [autoLoginGuard],
    loadChildren: () => import('./pages/sign-up/sign-up.module').then((m) => m.SignUpPageModule),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardPageModule),
  },
  {
    path: 'new-card',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/new-card/new-card.module').then((m) => m.NewCardPageModule),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/checkout/checkout.module').then((m) => m.CheckoutPageModule),
  },
  {
    path: 'movements',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/movements/movements.module').then((m) => m.MovementsPageModule),
  },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
