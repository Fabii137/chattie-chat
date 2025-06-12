import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-server-room-dialog',
  imports: [MatDialogModule, MatInputModule, FormsModule, MatButtonModule],
  templateUrl: './new-server-room-dialog.component.html',
  styleUrl: './new-server-room-dialog.component.css'
})
export class NewServerRoomDialogComponent {
  roomName: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewServerRoomDialogComponent>,
    private snackBar: MatSnackBar
  ) { }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate() {
    if (!this.roomName.trim()) {
      this.openSnackBar('Please enter a group name.');
      return;
    }
    this.dialogRef.close({
      roomName: this.roomName.trim(),
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    })
  }
}
