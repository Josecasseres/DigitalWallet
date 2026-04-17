import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { IdType } from '../../core/models/account-profile.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false,
})
export class SignUpPage {
  private fb = inject(FormBuilder);
  private account = inject(AccountService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  loading = false;
  showPass = false;
  step = 1;

  readonly idTypes: { value: IdType; label: string }[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
  ];

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    idType: ['CC' as IdType, [Validators.required]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{4,15}$/)]],
    country: ['Colombia', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      await this.account.createAccount(this.form.getRawValue());
      await this.feedback.ok('¡Cuenta creada exitosamente!');
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: unknown) {
      await this.feedback.fail(this.parseError(e));
    } finally { this.loading = false; }
  }

  goLogin(): void { this.router.navigateByUrl('/sign-in'); }

  private parseError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    const msg = (e as { message?: string })?.message ?? '';
    if (code.includes('email-already-in-use')) return 'El email ya está registrado';
    if (code.includes('weak-password')) return 'Contraseña débil (mín. 6 caracteres)';
    if (code.includes('invalid-email')) return 'Email inválido';
    if (code.includes('permission-denied')) return 'Firestore: permisos denegados';
    return msg || 'No se pudo crear la cuenta';
  }
}
