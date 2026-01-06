export const createFetch = (options: Pick<RequestInit, 'next' | 'cache'>) => {
  return (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options
    });
  };
};
