import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/reducers";
import FaceUpload from "./components/Test/FaceUpload";
import RealTimeFaceRecognition from "./components/Test/RealTimeFaceRecognition";
import Login from "./components/Auth/LoginPage";
import NotFound from "./components/NotFound";
import HomePage from "./components/HomePage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import StudentDashboard from "./components/Student/StudentDashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminNavbar from "./components/Admin/AdminNavbar";
import TeacherNavbar from "./components/Teacher/TeacherNavbar";
import StudentNavbar from "./components/Student/StudentNavbar";
import TeacherGroups from "./components/Teacher/TeacherGroups";
import GroupDetails from "./components/Group/GroupDetails";
import RegisterPage from "./components/Auth/RegisterPage";
import SessionPage from "./components/Session/SessionPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import ManageUsers from "./components/Admin/ManageUsers";
import ManageGroups from "./components/Admin/ManageGroups";
import GroupDetailsAdmin from "./components/Admin/GroupDetailsAdmin";
import TodaySessions from "./components/Student/TodaySessions";
import AttendanceMark from "./components/Student/AttendanceMark";
import PrivacyPolicy from "./components/General/PrivacyPolicy";
import StudentAttendanceHistory from "./components/Student/StudentAttendanceHistory";
import SessionDetails from "./components/Teacher/SessionDetails";
import AdminSessionDetails from "./components/Admin/AdminSessionDetails";
import BatchRecognitionPage from "./components/Test/BatchRecognitionPage";
const App: React.FC = () => {
    const token = useSelector((state: RootState) => state.UserReducer.token);
    const role = useSelector((state: RootState) => state.UserReducer.role);

    const hideNavbarPrefixes = ["/register", "/login",];

    const shouldHideNavbar = hideNavbarPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix)
    );

    return (
        <div>
            {token && !shouldHideNavbar && (
                role === "Admin" || role === "Moderator" ? <AdminNavbar /> :
                role === "Lecturer" ? <TeacherNavbar /> :
                <StudentNavbar />
            )}


            <Routes>

                <Route path="/" element={
                    token ? (
                        role === "Admin" || role === "Moderator" ? <Navigate to="/admin" /> :
                        role === "Lecturer" ? <Navigate to="/teacher" /> :
                        <Navigate to="/student" />
                    ) : (
                        <Login />
                    )
                } />

                <Route path="/" element={token ? <HomePage /> : <Login />} />
                <Route
                path="/login"
                element={
                    token ? (
                    role === "Admin" || role === "Moderator" ? <Navigate to="/admin" /> :
                    role === "Lecturer" ? <Navigate to="/teacher" /> :
                    <Navigate to="/student" />
                    ) : (
                    <Login />
                    )
                }
                />

                <Route path="/register" element={<RegisterPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                <Route element={<PrivateRoute />}>
                    <Route path="/FaceUpload" element={<FaceUpload />} />
                    <Route path="/real-time" element={<RealTimeFaceRecognition />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={["Admin", "Moderator"]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="/admin/groups" element={<ManageGroups />} />
                    <Route path="/admin/session/:sessionId" element={<AdminSessionDetails />} />
                    <Route path="/admin/groups/:id" element={<GroupDetailsAdmin />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={["Lecturer"]} />}>
                    <Route path="/teacher" element={<TeacherDashboard />} />
                    <Route path="/teacher/groups" element={<TeacherGroups />} />
                    <Route path="/group/:groupId" element={<GroupDetails />} />
                    <Route path="/session/:sessionId" element={<SessionPage />} />
                    <Route path="/teacher/session/:sessionId" element={<SessionDetails />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={["Student"]} />}>
                    <Route path="/student" element={<StudentDashboard />} />
                    <Route path="/student/sessions/today" element={<TodaySessions />} />
                    <Route path="/student/attendance/history" element={<StudentAttendanceHistory />} />
                    <Route path="/student/session/:sessionId/mark" element={<AttendanceMark />} />
                    <Route path="/face-test" element={<BatchRecognitionPage />} />

                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default App;
