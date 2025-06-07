import { Injectable } from '@angular/core';
import { User } from '../entities/user.entity';
import { BackendService } from './backend.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;
  constructor(private backendService: BackendService, private snackBar: MatSnackBar, private router: Router) {
    const storagedEmail = localStorage.getItem('email');
    const storagedPassword = localStorage.getItem('password');
    if(storagedEmail && storagedPassword)
      this.login(storagedEmail, storagedPassword, false);
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getFriends(): User[] {
    return this.currentUser?.friends ?? [];
  }

  getOnlineFriends(): User[] {
    return (this.currentUser?.friends ?? []).filter(friend => friend.isOnline);
  }

  async register(username: string, email: string, password: string, saveCredentials: boolean): Promise<User | null> {
    try {
      const user = await this.backendService.register(username, email, password).toPromise();
      if (user) {
        this.currentUser = user;
        this.openSnackBar(`Successfully logged in as ${user.username}`)
        if(saveCredentials)
          this.saveCredentials(email, password);
        this.router.navigate(['friends']);
      }
      return user ? user : null;
    } catch (error: unknown) {
      if (this.isHttpError(error) && error.status === 409) {
        console.error(error.error.message);
        this.openSnackBar(error.error.message);
      }
      return null;
    }
  }

  async login(email: string, password: string, saveCredentials: boolean): Promise<User | null> {
    try {
      const user = await this.backendService.login(email, password).toPromise();
      if (user) {
        this.currentUser = user;
        this.openSnackBar(`Successfully logged in as ${user.username}`)
        if(saveCredentials)
          this.saveCredentials(email, password);
        this.router.navigate(['friends']);
      }
      return user ? user : null;
    } catch (error: unknown) {
      if (this.isHttpError(error) && error.status === 401) {
        console.error(error.error.message);
        this.openSnackBar(error.error.message);
      }
      return null;
    }
  }

  logOut() {
    if(!this.currentUser)
      return;

    this.backendService.setOffline(this.currentUser);
    this.deleteSavedCredentials();
    this.currentUser = null;
    this.router.navigate(['login']);
  }

  setOffline() {
    const user = this.currentUser;
    this.backendService.setOffline(user);
  }

  isHttpError(error: any): error is { status: number; error: { message: string } } {
    return error && typeof error.status === 'number' && error.error && typeof error.error.message === 'string';
  }

  saveCredentials(email: string, password: string) {
    // TODO: token instead of password!
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
  }

  deleteSavedCredentials() {
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
