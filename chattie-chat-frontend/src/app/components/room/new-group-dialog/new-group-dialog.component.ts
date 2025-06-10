import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { User } from '../../../../entities/user.entity';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-new-group-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  templateUrl: './new-group-dialog.component.html',
  styleUrls: ['./new-group-dialog.component.css'],
})
export class NewGroupDialogComponent {
  groupName: string = '';

  constructor(
    public dialogRef: MatDialogRef<NewGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { friends: User[] },
    private snackBar: MatSnackBar
  ) { }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate(selectedOptions: MatListOption[]) {
    const selectedFriends: User[] = selectedOptions.map((option) => option.value);
    if (!this.groupName.trim()) {
      this.openSnackBar('Please enter a group name.');
      return;
    }
    if (selectedFriends.length < 2) {
      this.openSnackBar('Please select at least 2 friends.');
      return;
    }
    this.dialogRef.close({
      groupName: this.groupName.trim(),
      members: selectedFriends,
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
