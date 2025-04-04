/* eslint-disable class-methods-use-this */
import { parseCookies, setCookie, destroyCookie } from "nookies";

import { ICookieAdapter } from "~/protocols/cookies/ICookiesAdapter";

export class CookiesAdapter implements ICookieAdapter {
  set(name, value, options = {}) {
    setCookie(undefined, name, value, { path: "/", ...options });
  }

  get(name, ctx = undefined) {
    const cookies = parseCookies(ctx);
    return cookies[name] ?? null;
  }

  destroy(name, options = {}) {
    destroyCookie(undefined, name, { path: "/", ...options });
  }
}
