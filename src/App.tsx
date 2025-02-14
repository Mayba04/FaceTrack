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
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import StudentDashboard from "./components/Student/StudentDashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminNavbar from "./components/AdminNavbar";
import TeacherNavbar from "./components/Teacher/TeacherNavbar";
import StudentNavbar from "./components/Student/StudentNavbar";

const App: React.FC = () => {
    const token = useSelector((state: RootState) => state.UserReducer.token);
    const role = useSelector((state: RootState) => state.UserReducer.role);

    return (
        <div>
            {token && (
                role === "Admin" || role === "Moderator" ? <AdminNavbar /> :
                role === "Lecturer" ? <TeacherNavbar /> :
                <StudentNavbar />
            )}

            <Routes>
                <Route path="/" element={token ? <HomePage /> : <Login />} />
                <Route path="/login" element={<Login />} />

                <Route element={<PrivateRoute />}>
                    <Route path="/FaceUpload" element={<FaceUpload />} />
                    <Route path="/real-time" element={<RealTimeFaceRecognition />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={["Admin", "Moderator"]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={["Lecturer"]} />}>
                    <Route path="/teacher" element={<TeacherDashboard />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={["Student"]} />}>
                    <Route path="/student" element={<StudentDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default App;
