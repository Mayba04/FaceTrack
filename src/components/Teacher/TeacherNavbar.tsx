import { Menu } from "antd";
import { BookOutlined, LogoutOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/action-creators/userActions";
import { useState } from "react";
import UserProfileModal from "../modals/UserProfileModal";
import LanguageSwitcher from "../General/LanguageSwitcher";
import GoogleTranslate from "../General/GoogleTranslate";

const TeacherNavbar: React.FC = () => {
  const dispatch = useDispatch();
  const [profileOpen, setProfileOpen] = useState(false);

  const items = [
    { 
        key: "dash", 
        icon: <BookOutlined />, 
        label: <NavLink to="/teacher">Інформаційна панель</NavLink> 
    },
    { 
        key: "groups", 
        icon: <TeamOutlined />, 
        label: <NavLink to="/teacher/groups">Мої групи</NavLink> 
    },
    { 
        key: "profile", 
        icon: <UserOutlined />,
        label: <span style={{ cursor: "pointer" }} onClick={() => setProfileOpen(true)}>Профіль</span> 
    },
    {
        key: "logout", icon: <LogoutOutlined />,
        style: { marginLeft: "auto" },
        label: <span style={{ cursor: "pointer" }} onClick={() => dispatch(logout() as any)}>Вийти</span> 
    },
    { 
        key: "lang", 
        label: <LanguageSwitcher />, 
        style: { marginLeft: 24 } 
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

export default TeacherNavbar;
