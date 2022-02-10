import React, {useContext} from "react";
import { Navigate } from 'react-router-dom';
import {AuthContext} from './AuthContextProvider';

export const RequireAuth = ({ children }) => {
    const auth = useContext(AuthContext);
    return auth.isAuthenticated
        ? children
        : <Navigate to="/admin" replace />;
}
