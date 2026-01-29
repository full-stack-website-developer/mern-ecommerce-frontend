import { createContext, useEffect, useState } from "react";
import { verifyToken } from "../services/authService";

export const UserContext = createContext({});

const UserProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAndLoadUser = async () => {
            const savedUser = localStorage.getItem('user');
            const savedToken = localStorage.getItem('token');

            if (!savedUser || !savedToken) {
                setLoading(false);
                return;
            }

            try {
                const res = await verifyToken(savedToken)
                console.log(user)
                if (res.ok) {
                    setUser(JSON.parse(savedUser));
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } catch(err) {
                console.error('Error verifying token:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
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