export interface ICookieAdapter {
  set(name: string, value: string, options?: object): void;
  get(name: string, ctx?: any): string | null;
  destroy(name: string, options?: object): void;
}
