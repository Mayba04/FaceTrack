import { Menu } from "antd";
import { UploadOutlined, VideoCameraOutlined, LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/action-creators/userActions";

const Navbar: React.FC = () => {
    const dispatch = useDispatch();

    const items = [
        {
            key: "home",
            icon: <HomeOutlined style={{ fontSize: "18px" }} />,
            label: <NavLink to="/" style={{ fontSize: "18px" }}>Home</NavLink>,
        },
        {
            key: "upload",
            icon: <UploadOutlined style={{ fontSize: "18px" }} />,
            label: <NavLink to="/FaceUpload" style={{ fontSize: "18px" }}>Face Upload</NavLink>,
        },
        {
            key: "real-time",
            icon: <VideoCameraOutlined style={{ fontSize: "18px" }} />,
            label: <NavLink to="/real-time" style={{ fontSize: "18px" }}>Real-Time Recognition</NavLink>,
        },
        {
            key: "logout",
            icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
            label: <span style={{ fontSize: "18px", cursor: "pointer" }} onClick={() => dispatch(logout() as any)}>Logout</span>,
            style: { marginLeft: "auto" }, // Вирівнюємо вправо
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
                justifyContent: "space-between", // Рівномірний розподіл
            }}
        />
    );
};

export default Navbar;
