export interface AuthUser {
  email: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
}

const AUTH_STORAGE_KEY = 'saviour_auth_user_v1';

export const DEFAULT_OWNER_USER: AuthUser = {
  name: 'PS Saran',
  email: 'admin@saviourpharmacy.com',
  role: 'Owner',
  avatar: 'PS',
  initials: 'PS',
};

export class AuthService {
  public static getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return {
          ...DEFAULT_OWNER_USER,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  public static login(email: string, password: string): { success: boolean; error?: string; user?: AuthUser } {
    if (!email || !password) {
      return { success: false, error: 'Please fill in both email and password.' };
    }

    const user: AuthUser = {
      ...DEFAULT_OWNER_USER,
      email: email.trim() || DEFAULT_OWNER_USER.email,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  }

  public static logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to logout', e);
    }
  }

  public static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}
