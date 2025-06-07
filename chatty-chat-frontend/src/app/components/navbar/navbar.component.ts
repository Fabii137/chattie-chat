import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  constructor(private router: Router, private authService: AuthService) { }

  onToggle() {
    this.toggleSidenav.emit();
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  logOut() {
    this.authService.logOut();
  }
}
