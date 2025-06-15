import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatTooltipModule } from '@angular/material/tooltip'
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { User } from '../entities/user.entity';
import { AddServerDialogComponent } from './app.add-server-dialog/add-server-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Server } from '../entities/server.entity';
import { ServerService } from '../services/server.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatToolbarModule, MatIconModule, NavbarComponent, CommonModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  @ViewChild('drawer') drawer!: MatDrawer;
  title = 'chatty-chat-frontend';
  constructor(private authService: AuthService, private matDialog: MatDialog, private serverService: ServerService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnDestroy(): void {
    this.authService.setOffline();
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    this.authService.setOffline();
  }

  openCreateServerDialog() {
    const dialogRef = this.matDialog.open(AddServerDialogComponent);

    dialogRef.afterClosed().subscribe((result: { serverName: string}) => {
      if (!result)
        return;
      this.serverService.createServer(result.serverName).subscribe((server) => {
        this.authService.currentUser?.servers.push(server);
        this.snackBar.open(`Successfully created server ${result.serverName}`);
      });
    });
  }

  openServerPage(server: Server) {
    if(!server.id)
      return;

    this.router.navigate(['servers', server.id]);
  }

  toggleDrawer() {
    this.drawer.toggle();
  }

  getLoggedInUser(): User | null {
    return this.authService.currentUser;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
