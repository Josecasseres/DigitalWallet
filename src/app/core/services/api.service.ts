import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PushPayload {
  token: string;
  notification: { title: string; body: string };
  android: { priority: 'high' | 'normal'; data: Record<string, string> };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private accessToken: string | null = null;

  private get baseUrl(): string {
    return environment.notificationsBackend.baseUrl;
  }

  private async fetchToken(): Promise<string> {
    const { email, password } = environment.notificationsBackend;
    const res: any = await firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/user/login`, { email, password })
    );
    const token: string =
      res?.token ?? res?.access_token ?? res?.jwt ?? res?.accessToken ??
      res?.data?.token ?? res?.data?.access_token ?? res?.data?.jwt ?? res?.user?.token;
    if (!token) throw new Error('No se recibió token del backend');
    this.accessToken = token.toLowerCase().startsWith('bearer ') ? token.slice(7).trim() : token;
    return this.accessToken;
  }

  private async getToken(): Promise<string> {
    return this.accessToken ?? await this.fetchToken();
  }

  async sendPush(payload: PushPayload): Promise<void> {
    let jwt = await this.getToken();
    const url = `${this.baseUrl}/notifications`;
    const doPost = (t: string) => firstValueFrom(
      this.http.post(url, payload, { headers: new HttpHeaders({ Authorization: `Bearer ${t}` }) })
    );
    try {
      await doPost(jwt);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        this.accessToken = null;
        jwt = await this.fetchToken();
        await doPost(jwt);
      } else throw err;
    }
  }
}
