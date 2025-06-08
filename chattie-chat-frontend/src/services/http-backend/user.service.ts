import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../../entities/user.entity';
import { environment } from '../../environments/environment';
import { Server } from '../../entities/server.entity';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getServers(userId: number): Observable<Server[]> {
    return this.http.get<Server[]>(`${environment.apiURL}users/${userId}/servers`).pipe(
      catchError(this.handleError)
    );
  }

  getFriends(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiURL}users/${userId}/friends`).pipe(
      catchError(this.handleError)
    );
  }

  getFriendRequests(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiURL}users/${userId}/friend-requests`).pipe(
      catchError(this.handleError)
    );
  }

  register(username: string, email: string, password: string): Observable<User | null> {
    return this.http.post<User | null>(`${environment.apiURL}users/register`, { username, email, password }).pipe(
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.post<User | null>(`${environment.apiURL}users/login`, { email, password }).pipe(
      catchError(this.handleError)
    );
  }

  setOffline(user: User | null): void {
    if (!user || !user.id) 
      return;
    navigator.sendBeacon(`${environment.apiURL}users/set-offline`, JSON.stringify({ userId: user.id }));
  }

  sendFriendRequest(senderId: number, receiverName: string): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/send-friend-request`, { senderId, receiverName }).pipe(
      catchError(this.handleError)
    );
  }

  acceptFriendRequest(senderId: number, receiverId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/accept-friend-request`, { senderId, receiverId }).pipe(
      catchError(this.handleError)
    );
  }

  rejectFriendRequest(senderId: number, receiverId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/reject-friend-request`, { senderId, receiverId }).pipe(
      catchError(this.handleError)
    );
  }

  deleteFriend(userId: number, friendId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiURL}users/delete-friend`, { userId, friendId }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      errorMessage = `${error.error.message}`;
    } else {
      errorMessage = `Server returned code: ${error.status}`;
    }
    console.error('UserService Error:', errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
}
