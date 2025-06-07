import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class BackendService {
  baseURL = '/api/';

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<User | null> {
    return this.http.post<User | null>(`${this.baseURL}users/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.post<User | null>(`${this.baseURL}users/login`, { email, password })
  }

  setOffline(user: User | null): void {
    if(!user || !user.id)
      return;
    navigator.sendBeacon(`${environment.apiURL}users/set-offline`, JSON.stringify({ userId: user.id }));
  }

}
