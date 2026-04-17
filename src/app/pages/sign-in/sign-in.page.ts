import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { FingerprintService } from '../../core/services/fingerprint.service';
import { FeedbackService } from '../../core/services/feedback.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
  standalone: false,
})
export class SignInPage implements OnInit {
  private fb = inject(FormBuilder);
  private account = inject(AccountService);
  private fingerprint = inject(FingerprintService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  loading = false;
  biometricAvailable = false;
  showPass = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async ngOnInit(): Promise<void> {
    if (!(await this.fingerprint.supported())) return;
    const stored = await this.fingerprint.retrieveEntry();
    this.biometricAvailable = !!stored;
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    try {
      const { email, password } = this.form.getRawValue();
      await this.account.signIn(email, password);
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: unknown) {
      await this.feedback.fail(this.parseError(e));
    } finally { this.loading = false; }
  }

  async signInGoogle(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {
      await this.account.signInWithGoogle();
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch {
      await this.feedback.fail('No se pudo iniciar sesión con Google');
    } finally { this.loading = false; }
  }

  async signInBiometric(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {
      const verified = await this.fingerprint.authenticate('Accede con biometría');
      if (!verified) return;
      const entry = await this.fingerprint.retrieveEntry();
      if (!entry) { await this.feedback.fail('Sin credenciales almacenadas'); return; }
      await this.account.signIn(entry.username, entry.secret);
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (e: unknown) {
      await this.feedback.fail(this.parseError(e));
    } finally { this.loading = false; }
  }

  goRegister(): void { this.router.navigateByUrl('/sign-up'); }

  private parseError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Credenciales incorrectas';
    if (code.includes('user-not-found')) return 'Usuario no encontrado';
    return 'Error al iniciar sesión';
  }
}
