import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import { fetchSessionsAction } from "../../store/action-creators/sessionAction";
import { Typography, Card, List, Spin, Button } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;

const GroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const students = useSelector((state: RootState) => state.UserReducer.users);
  const studentsLoading = useSelector((state: RootState) => state.UserReducer.loading);
  const sessions = useSelector((state: RootState) => state.SessionReducer.sessions);
  const sessionsLoading = useSelector((state: RootState) => state.SessionReducer.loading);

  useEffect(() => {
    if (groupId) {
      dispatch(fetchStudentByGroupIdAction(groupId));
      dispatch(fetchSessionsAction(String(groupId)));
    }
  }, [groupId, dispatch]);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "auto" }}>
      <Title level={2}>Деталі групи</Title>

      <Card title="Список студентів" style={{ marginBottom: 32 }}>
        {studentsLoading ? (
          <Spin />
        ) : students.length ? (
          <List
            bordered
            dataSource={students}
            renderItem={(s) => (
              <List.Item>
                {s.fullName} ({s.email})
              </List.Item>
            )}
          />
        ) : (
          <p>У цій групі немає студентів</p>
        )}
      </Card>

      <Card title="Сесії">
        {sessionsLoading ? (
          <Spin />
        ) : sessions.length ? (
          <List
            bordered
            dataSource={sessions}
            renderItem={(session) => (
              <List.Item
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <b>{session.name}</b> | Початок: {dayjs(session.startTime).format("DD.MM.YYYY HH:mm")} – 
                  Кінець: {dayjs(session.endTime).format("HH:mm")}
                </span>
                <Button
                  type="primary"
                  onClick={() => navigate(`/admin/session/${session.id}`)}
                >
                  Перейти до сесії
                </Button>
              </List.Item>
            )}
          />
        ) : (
          <p>Сесій ще не створено</p>
        )}
      </Card>
    </div>
  );
};

export default GroupDetails;
