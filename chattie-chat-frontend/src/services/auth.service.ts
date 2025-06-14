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

  async register(username: string, email: string, password: string, saveCredentials: boolean): Promise<User | null> {
    try {
      const url = `${environment.apiURL}auth/register`;
      const user = await firstValueFrom(this.http.post<User>(url, { username, email, password }, { withCredentials: true }));
      return user;

    } catch (error: any) {
      this.openSnackBar(error.message || 'Login failed');
      return null;
    }
  }

  async login(email: string, password: string, saveCredentials: boolean): Promise<User | null> {
    try {
      const url = `${environment.apiURL}auth/login`;
      const user = await firstValueFrom(this.http.post<User>(url, { email, password }, { withCredentials: true }));
      return user;
    } catch (error: any) {
      this.openSnackBar(error.message || 'Login failed');
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
      const user = await firstValueFrom(this.http.post<User>(url, { withCredentials: true }));
    } catch (error: any) {
      this.openSnackBar(error.message || 'Login failed');
    }

    this.userService.setOffline();
    this.currentUser = null;

    this.router.navigate(['login']);
  }

  setOffline() {
    const user = this.currentUser;
    if (!user)
      return;

    this.userService.setOffline();
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
