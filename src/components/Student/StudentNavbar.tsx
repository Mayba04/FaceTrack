import { Menu } from "antd";
import { ReadOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/action-creators/userActions";
import { useState } from "react";
import UserProfileModal from "../modals/UserProfileModal.tsx"; 
import GoogleTranslate from "../General/GoogleTranslate.tsx";

const StudentNavbar: React.FC = () => {
  const dispatch = useDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const items = [
    {
      key: "1",
      icon: <ReadOutlined style={{ fontSize: "18px" }} />,
      label: <NavLink to="/student" style={{ fontSize: "18px" }}>Student Dashboard</NavLink>,
    },
    {
      key: "profile",
      icon: <UserOutlined style={{ fontSize: "18px" }} />,
      label: <span style={{ fontSize: "18px", cursor: "pointer" }} onClick={() => setIsProfileOpen(true)}>Профіль</span>,
    },
    {
      key: "2",
      icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
      label: <span style={{ fontSize: "18px", cursor: "pointer" }} onClick={() => dispatch(logout() as any)}>Logout</span>,
      style: { marginLeft: "auto" },
    },
    
  ];

  return (
    <>
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
      <UserProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <GoogleTranslate />
      </div>
    </>
  );
};

export default StudentNavbar;
