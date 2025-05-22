import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { fetchTodayAttendanceAction } from "../../store/action-creators/attendanceAction";
import {
  checkManualCheckPendingAction,
  fetchTodaysSessionsAction
} from "../../store/action-creators/sessionAction";
import { Button, Spin, Typography, Alert } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { UserOutlined, ClockCircleOutlined, BookOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TodaySessions: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState<{ [sessionId: number]: boolean }>({});
  const [pendingManualChecks, setPendingManualChecks] = useState<{ [sessionId: number]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await dispatch(fetchTodaysSessionsAction(user!.id) as any);
      const { success, payload } = response as any;
      if (success) {
        setSessions(payload);

        for (const session of payload) {
          const status = await dispatch(fetchTodayAttendanceAction(session.sessionId, user!.id) as any);
          const { payload: markPayload } = status as any;
          setMarked(prev => ({ ...prev, [session.sessionId]: !!markPayload }));

          const manualCheck = await dispatch(
            checkManualCheckPendingAction(session.sessionId, user!.id) as any
          );
          setPendingManualChecks(prev => ({
            ...prev,
            [session.sessionId]: !!manualCheck.payload,
          }));
        }
      }
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
        paddingBottom: 64,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: "32px 20px",
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
            letterSpacing: 1.1,
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
            const now = moment();
            const startTime = moment(session.startTime);


            const isUpcoming = now.isBefore(startTime);
            const isActive = moment().isBetween(session.startTime, session.endTime);
            const alreadyMarked = marked[session.sessionId] || false;
            const manualCheckPending = pendingManualChecks[session.sessionId] || false;

            return (
              <div
                key={session.sessionId}
                style={{
                  background: "#f6fafd",
                  borderRadius: 16,
                  marginBottom: 24,
                  padding: "20px 18px",
                  border: isActive ? "2px solid #1976d2" : "2px solid #d8e5f2",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
               <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                    flexWrap: "wrap",
                    fontWeight: 600,
                    fontSize: 18,
                    color: "#24292f"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <UserOutlined style={{ marginRight: 7, color: "#1976d2" }} />
                    Група:{" "}
                    <span style={{ color: "#3b2fc0", fontWeight: 700, marginLeft: 4 }}>
                      {session.groupName}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <BookOutlined style={{ marginRight: 7, color: "#1976d2" }} />
                    Сесія:{" "}
                    <span style={{ color: "#3b2fc0", fontWeight: 700, marginLeft: 4 }}>
                      {session.name}
                    </span>
                  </div>
                </div>


                <div style={{ fontSize: 16, color: "#4b5563" }}>
                  <ClockCircleOutlined style={{ marginRight: 8, color: "#1976d2" }} />
                  Час: {moment(session.startTime).format("HH:mm")} – {moment(session.endTime).format("HH:mm")}
                </div>

                {manualCheckPending && (
                  <Alert
                    message="Ваша заявка на ручну перевірку відправлена"
                    type="info"
                    showIcon
                    style={{ marginBottom: 4, fontWeight: 500 }}
                  />
                )}

                {alreadyMarked && (
                  <div style={{ color: "#52c41a", fontWeight: 500, fontSize: 16 }}>
                    ✅ Ви вже відмітилися
                  </div>
                )}

                <Button
                  block
                  size="large"
                  disabled={!isActive || alreadyMarked || manualCheckPending}
                  onClick={() => handleNavigate(session.sessionId)}
                  style={{
                    marginTop: 8,
                    background:
                      isActive && !alreadyMarked && !manualCheckPending
                        ? "linear-gradient(90deg,#1976d2 0%,#64b5f6 100%)"
                        : "#f0f2f5",
                    color:
                      isActive && !alreadyMarked && !manualCheckPending ? "#fff" : "#7a92b3",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: 0.5,
                    boxShadow:
                      isActive && !alreadyMarked && !manualCheckPending
                        ? "0 2px 12px #1976d240"
                        : "none",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {manualCheckPending
                    ? "Очікує ручної перевірки"
                    : alreadyMarked
                    ? "Вже відмічено"
                    : isActive
                    ? "Перейти до заняття"
                    : isUpcoming
                    ? "Час заняття ще не настав"
                    : "Ви пропустили заняття"}
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
              fontWeight: 500,
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
