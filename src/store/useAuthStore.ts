import { create } from 'zustand';
import { UserModel } from '../utils/modelAPI';

interface AuthState {
    isAuth: boolean;
    userInfo: UserModel | null;
    signIn: (userData: UserModel) => void;
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('tmp_path');
        window.location.href = "/";
    },
}));
