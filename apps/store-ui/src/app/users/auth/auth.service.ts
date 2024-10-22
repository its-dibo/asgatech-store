import { User } from '#types/dto/user.dto';
import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private authVersion = 2;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    if (email === 'demo' && password === 'demo')
      return of<User>({
        id: 'abc',
        firstName: 'Demo',
        lastName: 'test',
        auth_token: '123',
      }).pipe(
        tap((user) => {
          this.setAuthData(user);
        }),
      );
    else return throwError(() => `wrong email or password`);
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage?.removeItem('user');
  }

  /**
   * use this function to load the auth data after the page is refreshed
   */
  loadAuthData() {
    // in SSR localStorage is not defined
    if (typeof localStorage === 'undefined') return;

    let authVersion = localStorage.getItem('authVersion');
    if (!authVersion || +authVersion < this.authVersion) {
      this.logout();
      return;
    }

    let userString = localStorage.getItem('user');
    if (userString) {
      try {
        let user: User = JSON.parse(userString);
        this.currentUserSubject.next(user);
      } catch {
        this.currentUserSubject.next(null);
      }
    } else {
      this.currentUserSubject.next(null);
    }
  }

  /**
   * use this method in places where you don't need reactivity
   */
  isAuthenticated() {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  setAuthData(user: User) {
    if (!user.auth_token) {
      throw new Error("the response doesn't contain an access token");
    }
    this.currentUserSubject.next(user);
    localStorage?.setItem('user', JSON.stringify(user));
    localStorage?.setItem('authVersion', `${this.authVersion}`);
  }
}
