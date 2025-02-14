import { Menu } from "antd";
import { BookOutlined, LogoutOutlined, TeamOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/action-creators/userActions";

const TeacherNavbar: React.FC = () => {
    const dispatch = useDispatch();

    const items = [
        {
            key: "1",
            icon: <BookOutlined style={{ fontSize: "18px" }} />,
            label: <NavLink to="/teacher" style={{ fontSize: "18px" }}>Teacher Dashboard</NavLink>,
        },
        {
            key: "2",
            icon: <TeamOutlined style={{ fontSize: "18px" }} />,
            label: <NavLink to="/teacher/groups" style={{ fontSize: "18px" }}>My Groups</NavLink>,
        },
        {
            key: "3",
            icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
            label: <span style={{ fontSize: "18px", cursor: "pointer" }} onClick={() => dispatch(logout() as any)}>Logout</span>,
            style: { marginLeft: "auto" },
        },
    ];

    return (
        <Menu
            theme="dark"
            mode="horizontal"
            items={items}
            style={{
                fontSize: "18px",
                padding: "12px 24px",
                height: "60px",
                display: "flex",
                alignItems: "center",
            }}
        />
    );
};

export default TeacherNavbar;
