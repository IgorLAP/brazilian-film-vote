/* eslint-disable class-methods-use-this */
import axios, { AxiosRequestConfig } from "axios";

import { IHttpClient } from "~/protocols/http/IHttpClient";

export class HttpClientAdapter implements IHttpClient {
  async post<T = any>(
    url: string,
    body: any,
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    const response = await axios.post<T>(url, body, options);
    return response.data;
  }

  async get<T = any>(
    url: string,
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    const response = await axios.get<T>(url, options);
    return response.data;
  }

  async put<T = any>(
    url: string,
    body: any,
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    const response = await axios.put<T>(url, body, options);
    return response.data;
  }

  async delete<T = any>(
    url: string,
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    const response = await axios.delete<T>(url, options);
    return response.data;
  }
}
