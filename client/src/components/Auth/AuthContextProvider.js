import React, {useEffect, createContext} from "react";
import {useLocalStorage} from "../../hooks";

export const AuthContext = createContext(null);


function AuthContextProvider({children}) {
    const defaultState = {
        isAuthenticated: false,
        user: null
    };

    const [auth, setAuth] = useLocalStorage('yp_user', defaultState);

    const loginReq = () => {
        fetch('/api/admin')
            .then(res => res.json())
            .then(res => {
                setAuth(res)
            })
            .catch(e => console.error(e));
    };

    useEffect(() => {
        loginReq();

        // Check if user is logged in every hour
        let timer = setInterval(() => {
            loginReq();
        }, 3600000);
        return () => clearInterval(timer);
    }, []);


    const login = (username, password) =>
        fetch('/api/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        })
            .then(res => res.json())
            .then(res => {
                setAuth(res);
                return res;
            })
            .catch(err => console.error(err))

    const logout = () =>
        fetch('/api/logout')
            .then(_ => {
                setAuth(defaultState);
            })


    return (
        <AuthContext.Provider value={{
            ...auth,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;