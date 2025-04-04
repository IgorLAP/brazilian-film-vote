export interface ICookieService {
  setToken(token: string, options?: object): void;
  getToken(): string | null;
  clearToken(options?: object): void;
}
