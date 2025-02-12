import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/reducers";

const PrivateRoute: React.FC = () => {
    const token = useSelector((state: RootState) => state.UserReducer.token);

    return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
