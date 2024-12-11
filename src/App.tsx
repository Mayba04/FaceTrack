import React from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import FaceUpload from "./components/FaceUpload";
import RealTimeFaceRecognition from "./components/RealTimeFaceRecognition";

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <h1>Face Recognition App</h1>
                {/* Навігація */}
                <nav>
                    <ul style={{ listStyle: "none", display: "flex", gap: "15px" }}>
                        <li>
                            <NavLink to="/" style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}>
                                Face Upload
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/real-time" style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}>
                                Real-Time Recognition
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                {/* Маршрути */}
                <Routes>
                    <Route path="/" element={<FaceUpload />} />
                    <Route path="/real-time" element={<RealTimeFaceRecognition />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
