import { Injectable } from '@angular/core';
import { User } from '../entities/user.entity';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  constructor(private userService: UserService, private snackBar: MatSnackBar, private router: Router, private http: HttpClient) {
    userService.getMe().subscribe({
      next: user => {
        this.currentUser = user;
        router.navigate(["friends"]);
      },
      error: _ => {
        this.currentUser = null;
      }
    })
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  async register(username: string, email: string, password: string): Promise<User | null> {
    try {
      const url = `${environment.apiURL}auth/register`;
      const user = await firstValueFrom(this.http.post<User>(url, { username, email, password }, { withCredentials: true }));
      this.currentUser = user;
      return user;
    } catch (error: any) {
      if(!environment.production)
        console.error('Register error:', error);
      if(error.error?.message !== 'Unauthorized')
        this.openSnackBar(error.message || 'Registration failed');
      return null;
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const url = `${environment.apiURL}auth/login`;
      const user = await firstValueFrom(this.http.post<User>(url, { email, password }, { withCredentials: true }));
      this.currentUser = user;
      return user;
    } catch (error: any) {
      if(!environment.production)
        console.error('Login error:', error);
      if(error.error?.message !== 'Unauthorized')
        this.openSnackBar(error.error?.message || 'Login failed');
      return null;
    }
  }


  refreshToken() {
    return this.http.post(`${environment.apiURL}auth/refresh`, {}, { withCredentials: true });
  }


  async logOut() {
    if (!this.currentUser)
      return;

    try {
      const url = `${environment.apiURL}auth/logout`;
      this.http.post<User>(url, { withCredentials: true }).subscribe();
    } catch (error: any) {
      this.openSnackBar(error.message || 'Login failed');
    }

    this.currentUser = null;

    this.router.navigate(['login']);
  }

  setOffline() {
    const user = this.currentUser;
    if (!user)
      return;

    this.userService.setOffline();
  }

  async initializeUser(): Promise<void> {
    try {
      await firstValueFrom(this.refreshToken());
      const user = await firstValueFrom(this.userService.getMe());
      this.currentUser = user;
    } catch {
      this.currentUser = null;
    }
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
