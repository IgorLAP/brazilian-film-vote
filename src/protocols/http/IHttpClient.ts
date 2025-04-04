export interface IHttpClient {
  post<T = any>(url: string, body: any, options?: object): Promise<T>;
  get<T = any>(url: string, options?: object): Promise<T>;
  put<T = any>(url: string, body: any, options?: object): Promise<T>;
  delete<T = any>(url: string, options?: object): Promise<T>;
}
