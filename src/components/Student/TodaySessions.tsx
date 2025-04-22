import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { getTodaysSessions } from "../../services/api-session-service";
import { Card, Button, message, Spin, Typography } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";

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
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await getTodaysSessions(user!.id);
      const { success, payload, message } = response as any;
      if (success) {
        setSessions(payload);
      } else {
        message.error("Failed to load today's sessions");
      }
    } catch {
      message.error("Something went wrong while fetching sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (sessionHistoryId: number) => {
    navigate(`/session/${sessionHistoryId}`);
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "auto" }}>
      <Title level={2}>Today's Sessions</Title>
      {loading ? (
        <Spin />
      ) : sessions.length ? (
        sessions.map((session) => (
            <Card key={`${session.sessionId}-${session.startTime}`} style={{ marginBottom: 16 }}>
            <p><b>Group:</b> {session.groupName}</p>
            <p><b>Time:</b> {moment(session.startTime).format("HH:mm")} - {moment(session.endTime).format("HH:mm")}</p>
            <Button
              type="primary"
              disabled={!(moment().isBetween(session.startTime, session.endTime))}
              onClick={() => handleNavigate(session.sessionHistoryId)}
            >
              Go to Session
            </Button>
          </Card>
        ))
      ) : (
        <p>No sessions scheduled for today.</p>
      )}
    </div>
  );
};

export default TodaySessions;
