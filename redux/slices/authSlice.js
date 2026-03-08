import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
        isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
    },
    reducers: {
        setCredentials: (state, action) => {
            const { access_token, user } = action.payload;
            state.token = access_token;
            state.user = user;
            state.isAuthenticated = true;
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', access_token);
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
