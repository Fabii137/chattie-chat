import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<any>(null);

    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const request = req.clone({ withCredentials: true });

        return next.handle(request).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 401 && error.error?.error === 'AccessTokenExpired') {
                    return this.handleRefreshTokenError(request, next);
                }
                return throwError(() => error);
            })
        )
    }

    private handleRefreshTokenError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true; // avoiding requesting multiple refresh tokens
            this.refreshTokenSubject.next(null); // refresh is starting

            return this.authService.refreshToken().pipe(
                switchMap(() => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(true); // notifies other responses
                    return next.handle(request.clone({ withCredentials: true }));
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    this.authService.logOut(); // fallback logout if refresh fails
                    return throwError(() => err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(() => next.handle(request.clone({ withCredentials: true })))
            );
        }
    }
}