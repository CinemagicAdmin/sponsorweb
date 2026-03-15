const TOKEN_KEY = 'vendit_access_token';
const REFRESH_KEY = 'vendit_refresh_token';
const USER_KEY = 'vendit_user';
const MACHINE_KEY = 'vendit_machine_id';

export const storage = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setAccessToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),

  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_KEY, token),

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: Record<string, unknown>) =>
    localStorage.setItem(USER_KEY, JSON.stringify(user)),

  getMachineId: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(MACHINE_KEY);
  },
  setMachineId: (id: string) => localStorage.setItem(MACHINE_KEY, id),

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
