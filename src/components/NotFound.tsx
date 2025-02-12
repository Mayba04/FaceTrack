import React from "react";
import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import { FrownOutlined } from "@ant-design/icons";

const NotFound: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #001529, #1890ff)",
      }}
    >
      <Result
        icon={<FrownOutlined style={{ fontSize: "64px", color: "#1890ff" }} />}
        title={<h1 style={{ color: "white", fontSize: "32px" }}>404 - Page Not Found</h1>}
        subTitle={<p style={{ color: "#ffffffa6", fontSize: "18px" }}>Sorry, the page you visited does not exist.</p>}
        extra={
          <Button type="primary" size="large">
            <Link to="/">Go Home</Link>
          </Button>
        }
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
        }}
      />
    </div>
  );
};

export default NotFound;
