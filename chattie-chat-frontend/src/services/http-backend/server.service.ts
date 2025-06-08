import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Server } from '../../entities/server.entity';

@Injectable({ providedIn: 'root' })
export class ServerService {
    constructor(private http: HttpClient) { }

    createServer(name: string, creatorId: number, iconUrl?: string): Observable<Server> {
        const url = `${environment.apiURL}/servers/create`;
        return this.http.post<Server>(url, { name, creatorId, iconUrl }).pipe(
            catchError(this.handleError)
        );
    }

    deleteServer(serverId: number, userId: number): Observable<void> {
        const url = `${environment.apiURL}/servers/delete`;
        return this.http.delete<void>(url, { body: { serverId, userId } }).pipe(
            catchError(this.handleError)
        );
    }

    joinServer(serverId: number, userId: number): Observable<Server> {
        const url = `${environment.apiURL}/servers/join`;
        return this.http.post<Server>(url, { serverId, userId }).pipe(
            catchError(this.handleError)
        );
    }

    leaveServer(serverId: number, userId: number): Observable<void> {
        const url = `${environment.apiURL}/servers/leave`;
        return this.http.post<void>(url, { serverId, userId }).pipe(
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
