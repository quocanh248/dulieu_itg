import { create } from 'zustand';

interface AccountLoginType {
    access_token: string;
    username: string;
    role: string;
    tmp_path: string;
    expirationTime: string;
    refresh_token: string;
}

interface AuthState {
    isAuth: boolean;
    userInfo: AccountLoginType | null;
    signIn: (userData: AccountLoginType) => void;
    signOut: () => void;
}

const storedState = JSON.parse(
    localStorage.getItem('authState') || '{"isAuth": false, "userInfo": null}'
);

export const useAuthStore = create<AuthState>((set) => ({
    ...storedState,
    signIn: (userInfo) => {
        set({ isAuth: true, userInfo });
        localStorage.setItem('authState', JSON.stringify({ isAuth: true, userInfo }));
    },
    signOut: () => {
        set({ isAuth: false, userInfo: null });
        localStorage.removeItem('authState');
        localStorage.removeItem('access_token');
    },
}));
