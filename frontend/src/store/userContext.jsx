import { createContext, useEffect, useState } from "react";
import authService from "../services/auth.service";

export const UserContext = createContext({});

const UserProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAndLoadUser = async () => {
            const savedUser = authService.getCurrUser();
            const savedToken = authService.getToken();

            if (!savedUser || !savedToken) {
                setLoading(false);
                return;
            }

            try {
                const res = await authService.verifyToken()
                if (res.success) {
                    setUser(savedUser);
                } else {
                    authService.clearAuthData();
                    setUser(null);
                }
            } catch(err) {
                console.error('Error verifying token:', err);
                authService.clearAuthData();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyAndLoadUser();
    }, []);

    const values = {
        user,
        setUser,
        loading,
    };

    return <UserContext.Provider value={values}>
        {children}
    </UserContext.Provider>
};


export default UserProvider;