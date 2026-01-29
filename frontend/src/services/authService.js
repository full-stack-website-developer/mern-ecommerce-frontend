const apiUrl = import.meta.env.VITE_API_URL;

export const registerUser = async (user) => {
    const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(convertLocalToServer(user)),
    });

    const data = await res.json();
    return { data };
};

export const login = async (credentials) => {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
    });

    const data = await res.json();
    return { data };
};

function convertLocalToServer(user) {
    return {
        firstName: user.fName,
        lastName: user.lName,
        email: user.email,
        phone: user.phone,
        password: user.password,
        terms: user.terms,
    }
}


export const verifyToken = async (token) => {
    try {
        const res = await fetch(`${apiUrl}/api/auth/verifyToken`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        return res;
    } catch (err) {
        console.error('Error verifying token:', err);
    }
};