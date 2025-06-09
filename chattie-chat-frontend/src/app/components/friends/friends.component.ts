import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../services/http-backend/user.service';
import { User } from '../../../entities/user.entity';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../../services/http-backend/room.service';

type FriendSection = 'online' | 'all' | 'requests' | 'add';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, CommonModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent {
  activeSection: FriendSection = 'online';
  friends: User[] = [];
  onlineFriends: User[] = [];
  friendRequests: User[] = [];

  newFriendUsername: string = '';

  user: User | null = null;

  constructor(private userService: UserService, private roomService: RoomService, authService: AuthService, private confirmDialogService: ConfirmDialogService, private snackBar: MatSnackBar, private router: Router) {
    this.user = authService.currentUser;
    this.loadFriends();
    this.loadFriendRequests();
  }

  showSection(section: FriendSection): void {
    this.activeSection = section;
    this.loadFriendRequests();
    this.loadFriends();
  }

  deleteFriend(friend: User): void {
    if(!this.user || !this.user.id || !friend || !friend.id) {
      this.openSnackbar('Invalid user or friend data');
      return;
    }

    this.confirmDialogService.openDialog({
      title: 'Delete Friend',
      message: `Are you sure you want to delete ${friend.username} from your friends?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteFriend(this.user?.id || 0, friend.id || 0).subscribe({
          next: () => {
            this.friends = this.friends.filter(f => f.id !== friend.id);
            this.onlineFriends = this.onlineFriends.filter(f => f.id !== friend.id);
          },
          error: (error) => {
            this.openSnackbar(error.message || 'Error deleting friend');
          }
        });
      }
    });
  }

  sendFriendRequest(): void {
    if(!this.user || !this.user.id || !this.newFriendUsername) {
      this.openSnackbar('Invalid user or username');
      return;
    }

    this.userService.sendFriendRequest(this.user.id, this.newFriendUsername).subscribe({
      next: () => {
        this.openSnackbar(`Friend request sent to ${this.newFriendUsername}`);
        this.newFriendUsername = '';
      },
      error: (error) => {
        this.openSnackbar(error.message || 'Error adding friend');
      }
    });
  }

  loadFriends(): void {
    if(!this.user || !this.user.id) {
      this.openSnackbar('User not found');
      return;
    }

    this.userService.getUserById(this.user.id).subscribe({
      next: (user: User) => {
        this.user = user;
        console.log(user.friends);
        this.friends = user.friends;
        this.onlineFriends = this.friends.filter(friend => friend.isOnline);
      },
      error: (error) => {
        console.error('Error loading friends:', error);
      }
    });
  }

  loadFriendRequests(): void {
    if(!this.user || !this.user.id) {
      this.openSnackbar('User not found');
      return;
    }

    this.userService.getFriendRequests(this.user.id).subscribe({
      next: (requests: User[]) => {
        this.friendRequests = requests;
      },
      error: (error) => {
        console.error('Error loading friend requests:', error);
      }
    });
  }

  acceptFriendRequest(request: User): void {
    if(!this.user || !this.user.id || !request || !request.id) {
      this.openSnackbar('Invalid user or request data');
      return;
    }

    this.userService.acceptFriendRequest(request.id, this.user.id).subscribe({
      next: () => {
        this.loadFriendRequests();
        this.loadFriends();
        this.openSnackbar(`Accepted friend request from ${request.username}`);
      },
      error: (error) => {
        this.openSnackbar(error.message || 'Error accepting friend request');
      }
    });
  }

  rejectFriendRequest(request: User): void {
    if(!this.user || !this.user.id || !request || !request.id) {
      this.openSnackbar('Invalid user or request data');
      return;
    }
    this.userService.rejectFriendRequest(this.user.id, request.id).subscribe({
      next: () => {
        this.loadFriendRequests();
        this.loadFriends();
        this.openSnackbar(`Rejected friend request from ${request.username}`);
      },
      error: (error) => {
        this.openSnackbar(error.message || 'Error rejecting friend request');
      }
    });
  }

  openChat(friend: User) {
    if(!this.user)
      return;

    this.roomService.openDMRoom(this.user.id, friend.id).subscribe(room => {
      this.router.navigate(['room', room.id]);
    })
  }

  getAvatar(user: User): string {
    return user.avatarUrl || 'assets/img/default.jpg';
  }

  openSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
