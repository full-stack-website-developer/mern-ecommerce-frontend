import { createContext, useEffect, useState } from "react";
import authService from "../services/auth.service";
import userService from "../services/user.service";

export const UserContext = createContext({
    user: () => {},
    setUser: () => {},
    loading: Boolean,
});

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAndLoadUser = async () => {
            const savedToken = authService.getToken();

            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {
                const res = await userService.getUser()

                if (res.success) {
                    setUser(res.data.user);
                } else {
                    authService.clearAuthData();
                    setUser(null);
                }
            } catch(err) {
                console.error('Error verifying token or Fetching User data:', err);
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