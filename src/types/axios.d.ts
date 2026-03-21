import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, the API client will not show global toast banners for this request. */
    skipGlobalErrorToast?: boolean;
  }
}
