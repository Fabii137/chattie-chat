import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-server-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-server-dialog.component.html',
  styleUrls: ['./add-server-dialog.component.css'],
})
export class AddServerDialogComponent {
  serverName: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddServerDialogComponent>,
    private snackBar: MatSnackBar
  ) { }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate() {
    if (!this.serverName.trim()) {
      this.openSnackBar('Please enter a server name.');
      return;
    }
    this.dialogRef.close({
      serverName: this.serverName.trim(),
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
