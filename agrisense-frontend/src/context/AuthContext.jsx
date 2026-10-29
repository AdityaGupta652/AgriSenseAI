import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('agrisense_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const loginUser = (userData, token) => {
        localStorage.setItem('agrisense_user', JSON.stringify(userData));
        localStorage.setItem('agrisense_token', token);
        setUser(userData);
    };

    const logoutUser = () => {
        localStorage.removeItem('agrisense_user');
        localStorage.removeItem('agrisense_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
