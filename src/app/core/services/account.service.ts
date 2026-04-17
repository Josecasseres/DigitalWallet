import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  authState,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { DatabaseService } from './database.service';
import { AccountProfile } from '../models/account-profile.model';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  idType: AccountProfile['idType'];
  idNumber: string;
  country: string;
  email: string;
  password: string;
}

const GOOGLE_CLIENT_ID = '616546260130-9t6j3qlv7kf8o1p2q3r4s5t6u7v8w9x0.apps.googleusercontent.com';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private auth = inject(Auth);
  private db = inject(DatabaseService);
  private googleReady = false;

  readonly activeUser$: Observable<User | null> = authState(this.auth);

  private async initGoogle(): Promise<void> {
    if (this.googleReady) return;
    await GoogleSignIn.initialize({ clientId: GOOGLE_CLIENT_ID });
    this.googleReady = true;
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  async signIn(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async createAccount(data: RegistrationData): Promise<User> {
    const cred = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
    const displayName = `${data.firstName} ${data.lastName}`.trim();
    await updateProfile(cred.user, { displayName });

    const profile: AccountProfile = {
      uid: cred.user.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      idType: data.idType,
      idNumber: data.idNumber,
      country: data.country,
      email: data.email,
      registeredAt: Date.now(),
      biometricEnabled: false,
    };
    await this.db.saveDocument(`accounts/${cred.user.uid}`, profile);
    return cred.user;
  }

  async signInWithGoogle(): Promise<User> {
    await this.initGoogle();
    const result = await GoogleSignIn.signIn();
    if (!result.idToken) throw new Error('Google no devolvió idToken');
    const credential = GoogleAuthProvider.credential(result.idToken);
    const cred = await signInWithCredential(this.auth, credential);

    const profilePath = `accounts/${cred.user.uid}`;
    const existing = await this.db.fetchDocument<AccountProfile>(profilePath);
    if (!existing) {
      const [first = '', ...rest] = (cred.user.displayName ?? '').split(' ');
      const profile: AccountProfile = {
        uid: cred.user.uid,
        firstName: first,
        lastName: rest.join(' '),
        idType: 'CC',
        idNumber: '',
        country: '',
        email: cred.user.email ?? '',
        registeredAt: Date.now(),
        biometricEnabled: false,
      };
      await this.db.saveDocument(profilePath, profile);
    }
    return cred.user;
  }

  async signOut(): Promise<void> {
    try { await GoogleSignIn.signOut(); } catch { /* no-op */ }
    await signOut(this.auth);
  }

  getAccountProfile(uid: string): Promise<AccountProfile | null> {
    return this.db.fetchDocument<AccountProfile>(`accounts/${uid}`);
  }
}
