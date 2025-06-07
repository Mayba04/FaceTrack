import { Menu } from "antd";
import { ReadOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/action-creators/userActions";
import { useState } from "react";
import UserProfileModal from "../modals/UserProfileModal.tsx"; 
import GoogleTranslate from "../General/GoogleTranslate.tsx";
import LanguageSwitcher from "../General/LanguageSwitcher.tsx";

const StudentNavbar: React.FC = () => {
  const dispatch = useDispatch();
  const [profileOpen, setProfileOpen] = useState(false);

  const items = [
    {
      key: "dash",
      icon: <ReadOutlined style={{ fontSize: 18 }} />,
      label: <NavLink to="/student">Панель студента</NavLink>,
    },
    {
      key: "profile",
      icon: <UserOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ cursor: "pointer" }} onClick={() => setProfileOpen(true)}>
          Профіль
        </span>
      ),
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: 18 }} />,
      style: { marginLeft: "auto" },
      label: (
        <span style={{ cursor: "pointer" }} onClick={() => dispatch(logout() as any)}>
          Вийти
        </span>
      ),
    },
    {
      key: "lang",
      label: <LanguageSwitcher />,
      style: { marginLeft: 24 },
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
      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
        <GoogleTranslate />
      </div>
    </>
  );
};

export default StudentNavbar;
