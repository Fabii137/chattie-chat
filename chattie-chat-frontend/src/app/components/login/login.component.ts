import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox'

@Component({
  selector: 'app-login',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, CommonModule, FormsModule, MatIconModule, MatCheckboxModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  hidePassword: boolean = true;
  isRegistering: boolean = false;
  email: string = '';
  password: string = '';

  newUsername: string = '';
  newEmail: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  keepLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/friends']);
    }
  }

  toggle() {
    this.isRegistering = !this.isRegistering;
    this.resetFields();
  }

  async login() {
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();

    if (trimmedEmail && trimmedPassword) {
      const user = await this.authService.login(trimmedEmail, trimmedPassword, this.keepLoggedIn);
      if(user) {
        this.openSnackBar(`Successfully logged in as ${user.username}`)
        this.router.navigate(['friends']);
      }
    } else {
      this.openSnackBar('Enter valid email and password');
    }
  }

  async register() {
    const trimmedUsername = this.newUsername.trim();
    const trimmedEmail = this.newEmail.trim();
    const trimmedPassword = this.newPassword.trim();
    const trimmedConfirmPassword = this.confirmPassword.trim();

    if(trimmedPassword !== trimmedConfirmPassword) {
      this.openSnackBar('Password and Confirm Password are not the same!');
      return;
    }

    if(!this.isValidEmail(trimmedEmail) || !this.isValidPassword(trimmedPassword) || !this.isValidUsername(trimmedUsername))
      return;

    const user = await this.authService.register(trimmedUsername, trimmedEmail, trimmedPassword, this.keepLoggedIn);
    if(user) {
      this.openSnackBar(`Successfully registered as ${user.username}`);
      this.router.navigate(['friends']); 
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)) {
      this.openSnackBar('Please enter a valid email address');
      return false;
    }

    return true;
  }

  isValidPassword(password: string): boolean {
    if(password.length < 6) {
      this.openSnackBar('Password must be at least 6 characters long');
      return false;
    }

    return true;
  }

  isValidUsername(username: string): boolean {
    if(username.length < 3) {
      this.openSnackBar('Username must be at least 3 characters long')
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      this.openSnackBar('Username can only contain letters, numbers, and underscores');
      return false;
    }

    if(username.length > 20) {
      this.openSnackBar('Username must be smaller than 21 characters')
      return false;
    }

    return true;
  }

  async onEnterRegister() {
    await this.register();
  }

  async onEnterLogin() {
    await this.login();
  }

  resetFields() {
    this.keepLoggedIn = false;
    this.email = '';
    this.password = '';

    this.newUsername = '';
    this.newEmail = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.hidePassword = true;
  }

  showHidePassword() {
    this.hidePassword = !this.hidePassword;
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
