export const apiClient = async (url: string, options: RequestInit = {}) => {
  const finalOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  return fetch(url, finalOptions);
};
