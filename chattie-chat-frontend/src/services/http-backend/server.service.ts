import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Server } from '../../entities/server.entity';
import { Room } from '../../entities/room.entity';

@Injectable({ providedIn: 'root' })
export class ServerService {
    constructor(private http: HttpClient) { }

    getServerById(serverId: number): Observable<Server> {
        const url = `${environment.apiURL}servers/${serverId}`;
        return this.http.get<Server>(url).pipe(
            catchError(this.handleError)
        );
    }

    createServer(name: string, creatorId: number, iconUrl?: string): Observable<Server> {
        const url = `${environment.apiURL}servers/create`;
        return this.http.post<Server>(url, { name, creatorId, iconUrl }).pipe(
            catchError(this.handleError)
        );
    }

    deleteServer(serverId: number, userId: number): Observable<void> {
        const url = `${environment.apiURL}servers/${serverId}/delete`;
        return this.http.delete<void>(url, { body: { userId } }).pipe(
            catchError(this.handleError)
        );
    }

    inviteToServer(serverId: number, senderId: number, invites: number[]): Observable<void> {
        const url = `${environment.apiURL}servers/${serverId}/invite`;
        return this.http.post<void>(url, { senderId, invites });
    }

    joinServer(serverId: number, userId: number): Observable<Server> {
        const url = `${environment.apiURL}servers/${serverId}/join`;
        return this.http.post<Server>(url, { userId }).pipe(
            catchError(this.handleError)
        );
    }

    leaveServer(serverId: number, userId: number): Observable<void> {
        const url = `${environment.apiURL}servers/${serverId}/leave`;
        return this.http.post<void>(url, { userId }).pipe(
            catchError(this.handleError)
        );
    }

    createRoom(name: string, serverId: number, creatorId: number): Observable<Room> {
        const url = `${environment.apiURL}servers/${serverId}/create-room`;
        return this.http.post<Room>(url, { name, creatorId }).pipe(
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
        console.error('ServerService Error:', errorMessage);

        return throwError(() => new Error(errorMessage));
    }
}
