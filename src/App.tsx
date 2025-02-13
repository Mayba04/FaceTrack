import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/reducers";
import FaceUpload from "./components/FaceUpload";
import RealTimeFaceRecognition from "./components/RealTimeFaceRecognition";
import Login from "./components/LoginPage";
import NotFound from "./components/NotFound";
import HomePage from "./components/HomePage";
import AdminDashboard from "./components/AdminDashboard"; 
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar"; 

const App: React.FC = () => {
    const token = useSelector((state: RootState) => state.UserReducer.token);
    const role = useSelector((state: RootState) => state.UserReducer.role); 

    return (
        <div>
            {token && (role === "Admin" ? <AdminNavbar /> : <Navbar />)} 

            <Routes>
                <Route path="/" element={token ? <HomePage /> : <Login />} />
                <Route path="/login" element={<Login />} /> {/* 🔹 Окремий маршрут для логіну */}

                {/* 🔹 Маршрути для звичайних користувачів */}
                <Route element={<PrivateRoute />}>
                    <Route path="/FaceUpload" element={<FaceUpload />} />
                    <Route path="/real-time" element={<RealTimeFaceRecognition />} />
                </Route>

                {/* 🔹 Адмінські маршрути (тільки для адміна) */}
                {role === "Admin" && (
                    <Route element={<PrivateRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                )}

                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default App;
