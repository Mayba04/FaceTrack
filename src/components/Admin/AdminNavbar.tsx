import { Menu } from "antd";
import { DashboardOutlined, UserOutlined, LogoutOutlined, TeamOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/action-creators/userActions";
import UserProfileModal from "../modals/UserProfileModal";
import { useState } from "react";
import LanguageSwitcher from "../General/LanguageSwitcher";
import GoogleTranslate from "../General/GoogleTranslate";

const AdminNavbar: React.FC = () => {
    const dispatch = useDispatch();
    const [profileOpen, setProfileOpen] = useState(false);
    
    const items = [
    {
      key: "dash",
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: <NavLink to="/admin">Інформаційна панель</NavLink>,
    },
    {
      key: "users",
      icon: <UserOutlined style={{ fontSize: 18 }} />,
      label: <NavLink to="/manage-users">Користувачі</NavLink>,
    },
    {
      key: "groups",
      icon: <TeamOutlined style={{ fontSize: 18 }} />,
      label: <NavLink to="/admin/groups">Групи</NavLink>,
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
      label: <LanguageSwitcher />,          // перемикач мови
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

      <GoogleTranslate />

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default AdminNavbar;
