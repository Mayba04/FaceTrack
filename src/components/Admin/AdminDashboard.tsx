import React from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <Card style={{ width: 500, textAlign: "center", padding: 20 }}>
                <h2>Admin Panel</h2>
                <p>Manage users, settings, and system operations.</p>
                <Button type="primary" onClick={() => navigate("/FaceUpload")}>
                    Go to Face Upload
                </Button>
            </Card>
        </div>
    );
};

export default AdminDashboard;
