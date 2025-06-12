import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../entities/user.entity';

@Component({
  selector: 'app-invite-friend-dialog',
  standalone: true,
  templateUrl: './invite-friend-dialog.component.html',
  styleUrls: ['./invite-friend-dialog.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatCheckboxModule,
    FormsModule
  ]
})
export class InviteFriendDialogComponent {
  selectedFriends: Set<number> = new Set();

  constructor(
    public dialogRef: MatDialogRef<InviteFriendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serverName: string, friends: User[] }
  ) {}

  toggleSelection(userId: number) {
    if (this.selectedFriends.has(userId)) {
      this.selectedFriends.delete(userId);
    } else {
      this.selectedFriends.add(userId);
    }
  }

  invite() {
    this.dialogRef.close([...this.selectedFriends]);
  }

  cancel() {
    this.dialogRef.close();
  }
}
