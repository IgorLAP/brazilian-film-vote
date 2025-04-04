import type { ICookieService, ICookieAdapter } from "~/protocols/cookies";

export class CookieService implements ICookieService {
  constructor(
    private readonly cookieAdapter: ICookieAdapter,
    private readonly tokenName: string = "token",
  ) {}

  setToken(token: string, options = {}) {
    this.cookieAdapter.set(this.tokenName, token, options);
  }

  getToken(ctx?: any): string | null {
    return this.cookieAdapter.get(this.tokenName, ctx);
  }

  clearToken(options = {}) {
    this.cookieAdapter.destroy(this.tokenName, options);
  }
}
