import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { getTodaysSessions } from "../../services/api-session-service";
import { Button, Spin, Typography } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TodaySessions: React.FC = () => {
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await getTodaysSessions(user!.id);
      const { success, payload } = response as any;
      if (success) {
        setSessions(payload);
      }
    } catch {
      // error handled UI
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (sessionId: number) => {
    navigate(`/student/session/${sessionId}/mark`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e3f0ff 0%, #c6e6fb 100%)",
        paddingTop: 48,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 540,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: "32px 18px 24px 18px",
          boxShadow: "0 6px 32px 0 rgba(30,64,175,0.12)",
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: 36,
            color: "#1976d2",
            fontWeight: 800,
            letterSpacing: 1.2,
          }}
        >
          Сьогоднішні заняття
        </Title>
        {loading ? (
          <div style={{ textAlign: "center", margin: "32px 0" }}>
            <Spin size="large" />
          </div>
        ) : sessions.length ? (
          sessions.map((session) => {
            const isActive = moment().isBetween(
              session.startTime,
              session.endTime
            );
            return (
              <div
                key={`${session.sessionId}-${session.startTime}`}
                style={{
                  background: "#f6fafd",
                  borderRadius: 16,
                  marginBottom: 24,
                  padding: "22px 18px",
                  boxShadow: "0 2px 8px rgba(0,51,102,0.06)",
                  border: isActive
                    ? "2px solid #1976d2"
                    : "2px solid #eaf1fa",
                  transition: "border 0.3s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 18, color: "#24292f" }}>
                  <UserOutlined style={{ marginRight: 7, color: "#1976d2" }} />
                  Група:{" "}
                  <span style={{ color: "#3b2fc0", fontWeight: 700 }}>
                    {session.groupName}
                  </span>
                </div>
                <div style={{ color: "#363e4d", fontSize: 16 }}>
                  <ClockCircleOutlined style={{ marginRight: 7, color: "#1976d2" }} />
                  <span style={{ fontWeight: 500 }}>Час:</span>{" "}
                  {moment(session.startTime).format("HH:mm")} –{" "}
                  {moment(session.endTime).format("HH:mm")}
                </div>
                <Button
                  type="primary"
                  block
                  size="large"
                  disabled={!isActive}
                  onClick={() => handleNavigate(session.sessionHistoryId)}
                  style={{
                    marginTop: 10,
                    background: isActive
                      ? "linear-gradient(90deg,#1976d2 60%,#64b5f6)"
                      : "#f0f2f5",
                    color: isActive ? "#fff" : "#7a92b3",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 1,
                    boxShadow: isActive ? "0 2px 10px #1976d229" : "none",
                    transition: "background .15s, color .15s",
                  }}
                >
                  {isActive ? "Перейти до заняття" : "Поза часом заняття"}
                </Button>
              </div>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              color: "#8c9cb1",
              fontSize: 18,
            }}
          >
            На сьогодні немає запланованих занять.
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySessions;
