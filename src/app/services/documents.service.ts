import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface OAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'efact_token';
  private readonly tokenSubject = new BehaviorSubject<string | null>(this.restoreToken());

  readonly token$ = this.tokenSubject.asObservable();

  login(username: string, password: string) {
    const form = new URLSearchParams();
    form.set('grant_type', 'password');
    form.set('username', username);
    form.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: environment.basicAuthHeader
    });

    console.log('🔐 Login attempt:', {
      url: environment.api.oauthToken,
      username,
      body: form.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: environment.basicAuthHeader
      }
    });

    return this.http
      .post<OAuthResponse>(environment.api.oauthToken, form.toString(), { headers })
      .pipe(
        tap(res => console.log('✅ Login success:', res)),
        map((res) => res.access_token),
        tap((token) => this.setToken(token))
      );
  }

  getPdf(ticket: string) {
    return this.http.get(environment.api.pdf + ticket, {
      headers: this.authHeaders(),
      responseType: 'blob'
    });
  }

  getXml(ticket: string) {
    return this.http.get(environment.api.xml + ticket, {
      headers: this.authHeaders(),
      responseType: 'blob'
    });
  }

  getCdr(ticket: string) {
    return this.http.get(environment.api.cdr + ticket, {
      headers: this.authHeaders(),
      responseType: 'blob'
    });
  }

  getTokenSnapshot(): string | null {
    return this.tokenSubject.value;
  }

  clearToken() {
    this.tokenSubject.next(null);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this.tokenKey);
    }
  }

  private setToken(token: string) {
    this.tokenSubject.next(token);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.tokenKey, token);
    }
  }

  private authHeaders(token?: string) {
    const bearer = token ?? this.tokenSubject.value;
    return new HttpHeaders({ Authorization: bearer ? `Bearer ${bearer}` : '' });
  }

  private restoreToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(this.tokenKey);
  }
}
