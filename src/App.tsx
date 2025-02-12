import React from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/reducers";
import FaceUpload from "./components/FaceUpload";
import RealTimeFaceRecognition from "./components/RealTimeFaceRecognition";
import Login from "./components/LoginPage";
import NotFound from "./components/NotFound";
import HomePage from "./components/HomePage";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
    const token = useSelector((state: RootState) => state.UserReducer.token);

    return (
        <div>
            {token && <Navbar />} {/* Показуємо Navbar тільки якщо є токен */}

            <Routes>
                <Route path="/" element={token ? <HomePage /> : <Login />} />
                <Route path="/login" element={<Login />} /> {/* 🔹 Додаємо окремий шлях для логіну */}

                <Route element={<PrivateRoute />}>
                    <Route path="/FaceUpload" element={<FaceUpload />} />
                    <Route path="/real-time" element={<RealTimeFaceRecognition />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default App;
