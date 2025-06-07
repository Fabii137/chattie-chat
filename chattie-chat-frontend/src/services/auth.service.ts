import { Injectable } from '@angular/core';
import { User } from '../entities/user.entity';
import { UserService } from './http-backend/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  constructor(private userService: UserService, private snackBar: MatSnackBar, private router: Router) {
    const storagedEmail = localStorage.getItem('email');
    const storagedPassword = localStorage.getItem('password');
    if(storagedEmail && storagedPassword)
      this.login(storagedEmail, storagedPassword, false);
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  async register(username: string, email: string, password: string, saveCredentials: boolean): Promise<User | null> {
    try {
      const user = await firstValueFrom(this.userService.register(username, email, password));
      if (user) {
        this.currentUser = user;
        if(saveCredentials)
          this.saveCredentials(email, password);
        this.router.navigate(['friends']);
      }
      return user ? user : null;
    } catch (error: any) {
      this.openSnackBar(error.message || 'Registration failed');
      return null;
    }
  }

  async login(email: string, password: string, saveCredentials: boolean): Promise<User | null> {
    try {
      const user = await firstValueFrom(this.userService.login(email, password));
      if (user) {
        this.currentUser = user;
        if(saveCredentials)
          this.saveCredentials(email, password);
        this.router.navigate(['friends']);
      }
      return user ? user : null;
    } catch (error: any) {
      this.openSnackBar(error.message || 'Login failed');
      return null;
    }
  }

  logOut() {
    if(!this.currentUser)
      return;

    this.userService.setOffline(this.currentUser);
    this.deleteSavedCredentials();
    this.currentUser = null;
    this.router.navigate(['login']);
  }

  setOffline() {
    const user = this.currentUser;
    this.userService.setOffline(user);
  }

  saveCredentials(email: string, password: string) {
    // TODO: token instead of password!
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
  }

  deleteSavedCredentials() {
    // TODO: token instead of password!
    localStorage.removeItem('email');
    localStorage.removeItem('password');
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

}
