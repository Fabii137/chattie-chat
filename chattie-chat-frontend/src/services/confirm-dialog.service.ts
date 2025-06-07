import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../app/components/confirm-dialog/confirm-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class ConfirmDialogService {

    constructor(private dialog: MatDialog) { }

    openDialog(data: { message: string, title: string, confirmText: string, cancelText: string }): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, { data });

        return dialogRef.afterClosed();
    }
}