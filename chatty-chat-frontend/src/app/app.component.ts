import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from '../services/auth.service';
import { BackendService } from '../services/backend.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatToolbarModule, MatIconModule, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy{
  @ViewChild('drawer') drawer!: MatDrawer;
  title = 'chatty-chat-frontend';
  constructor(private authService: AuthService) { }

  ngOnDestroy(): void {
      this.authService.setOffline();
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    this.authService.setOffline();
  }

  toggleDrawer() {
    this.drawer.toggle();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
