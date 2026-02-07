import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://172.27.160.1:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR – token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // const fullUrl =
    //   (config.baseURL || '') +
    //   config.url +
    //   (config.params
    //     ? `?${new URLSearchParams(config.params as any).toString()}`
    //     : '');
    // console.log('Full URL:', fullUrl);

    // console.log("TOKEN:", token);
    // console.log("HEADERS:", config.headers);

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR – return data only
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An error occurred: ' + error.message;
    return Promise.reject(error);
  }
);

export default apiClient;
