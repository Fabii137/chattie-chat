import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../entities/user.entity';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  getMe(): Observable<User> {
    return this.http.get<User>(`${environment.apiURL}users/me`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  getFriendRequests(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiURL}users/friend-requests`, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  setOffline(): void {
    const url = `${environment.apiURL}users/set-offline`;

    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      keepalive: true,
    }).catch(err => {
      console.warn('Offline update failed:', err);
    });
  }

  sendFriendRequest(receiverName: string): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/send-friend-request`, { receiverName }, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  acceptFriendRequest(senderId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/accept-friend-request`, { senderId }, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  rejectFriendRequest(senderId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/reject-friend-request`, { senderId }, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  deleteFriend(friendId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/delete-friend`, { friendId }, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    if (error.status) {
      const errorMessage = error.error?.message ? `${error.error.message}` : `Server returned code: ${error.status}`;

      this.snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });

      console.error('UserService HTTP Error:', errorMessage, error);
    } else {
      console.warn('Non-HTTP error occurred:', error.message || error);
    }

    return throwError(() => error);
  };


}
