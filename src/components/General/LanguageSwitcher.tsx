import { Dropdown, Menu, MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import "./LanguageSwitcher.css";

const LANGS = [
  { code: "uk", label: "UA" },
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
];

const setGoogleCookie = (to: string) => {
  document.cookie = `googtrans=/uk/${to}; path=/`;
  document.cookie = `googtrans=/uk/${to}; domain=${location.hostname}; path=/`;
};

const LanguageSwitcher = () => {
  const [active, setActive] = useState(() => localStorage.getItem("lang") || "uk");

  const changeLang = (code: string, reload = true) => {
    setGoogleCookie(code);
    localStorage.setItem("lang", code);
    setActive(code);
    if (reload) location.reload();
  };

  const getLabel = (code: string) =>
  LANGS.find(l => l.code === code)?.label || code.toUpperCase();

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== "uk") changeLang(saved, false);
  }, []);

  const items: MenuProps["items"] = LANGS.map(l => ({
    key: l.code,
    label: <span className="notranslate">{l.label}</span>,  
  }));

  const onClick: MenuProps["onClick"] = ({ key }) => changeLang(key as string);

  return (
    <Dropdown
      overlay={
        <Menu
          items={items}
          onClick={onClick}
          selectable
          defaultSelectedKeys={[active]}
          className="notranslate"       /* ↤ і тут */
        />
      }
      trigger={["click"]}
    >
      
       <span className="lang-current">
      {getLabel(active)} <DownOutlined style={{ fontSize: 10 }} />
    </span>
    </Dropdown>
  );
};

export default LanguageSwitcher;
