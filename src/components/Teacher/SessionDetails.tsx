import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Modal,
  Spin,
  List,
  message,
  DatePicker,
  Input,
  Tooltip,
  Table
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  updateSessionAction,
  deleteSessionAction,
  fetchPendingFaceRequestsAction,
  approveFaceRequestAction,
  rejectFaceRequestAction,
  GetSessionByIdAction,
} from "../../store/action-creators/sessionAction";
//import { getAttendanceBySession } from "../../services/api-attendance-service";
import { startSession } from "../../services/api-session-service";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { APP_ENV } from "../../env";
import { addAbsenceAction, deleteAbsenceAction, fetchAttendanceMatrixBySessionAction } from "../../store/action-creators/attendanceAction";
import { addPlannedSessionAction, deletePlannedSessionAction, fetchPlannedSessionsBySessionIdAction, updatePlannedSessionAction } from "../../store/action-creators/plannedSessionAction";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { uk } from "date-fns/locale";
import { deleteSessionHistory, updateSessionHistoryDate } from "../../services/api-attendance-service";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const locales = {
    uk: uk,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  });

export const isoToDayjs = (src?: string | Date | null): Dayjs | null => {
  if (!src) return null;
  return typeof src === 'string'
    ? dayjs.utc(src).local()   // "2025-05-27T09:40:00Z"
    : dayjs(src);              // new Date()
};

const { Title } = Typography;
const keyOf = (item: any): React.Key =>
  item?.id ?? item?.studentId ?? item?.requestId ?? JSON.stringify(item);

const SessionDetails: React.FC = () => {
  
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mainSession = useSelector((state: RootState) => state.SessionReducer.session);
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const groups = useSelector((state: RootState) => state.GroupReducer.groups);
  const groupName = groups.find((g) => g.id === Number(mainSession?.groupId))?.name ?? "—";
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime,   setEndTime]   = useState<Dayjs | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [faceRequests, setFaceRequests] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const { matrix, loading: attendanceLoading } = useSelector((state: RootState) => state.AttendanceReducer);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planDate, setPlanDate] = useState<Dayjs | null>(null);
  const [planStart, setPlanStart] = useState<Dayjs | null>(null);
  const [planEnd, setPlanEnd] = useState<Dayjs | null>(null);
  const plannedSessions = useSelector((state: RootState) => state.PlannedSessionReducer.sessions); 
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [editSessionHistoryId, setEditSessionHistoryId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState<Dayjs | null>(null);
  const [isEditDateModalOpen, setIsEditDateModalOpen] = useState(false);



  useEffect(() => {
    if (sessionId) dispatch(GetSessionByIdAction(Number(sessionId)) as any);
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (mainSession?.id  && sessionId !== mainSession.id) {
      dispatch(fetchAttendanceMatrixBySessionAction(Number(mainSession.id)) as any);
    }
  }, [mainSession?.id]);
  
  useEffect(() => {
  if (mainSession?.id) {
    dispatch(fetchPlannedSessionsBySessionIdAction(Number(mainSession.id)) as any);
  }
 }, [mainSession?.id]);


const events = plannedSessions.map((ps: any) => {
  const date = new Date(ps.plannedDate); 

  const [startHours, startMinutes, startSeconds] = ps.startTime.split(":").map(Number);
  const [endHours, endMinutes, endSeconds] = ps.endTime.split(":").map(Number);

  const start = new Date(date);
  start.setHours(startHours, startMinutes, startSeconds ?? 0);

  const end = new Date(date);
  end.setHours(endHours, endMinutes, endSeconds ?? 0);

  return {
    id: ps.id,
    title: <span className="notranslate">{ps.sessionName}  🕓 {ps.startTime} — {ps.endTime}</span>,
    start,
    end,
  };
});


  
  const handleStart = async () => {
    if (!user?.id || !mainSession?.id) return;
    await startSession(Number(mainSession.id), user.id);
    navigate(`/session/${mainSession.id}`);
  };

const handleEdit = () => {
  if (!mainSession) return;

  // назва
  setName(mainSession.name ?? '');
  const asLocal = (iso?: string | Date | null): Dayjs | null => {
    if (!iso) return null;

    // рядок → забираємо Z → парсимо як локальний
    if (typeof iso === 'string') return dayjs(iso.replace(/Z$/, ''));

    return dayjs(iso);
  };

  // часи
  setStartTime(asLocal(mainSession.startTime));
  setEndTime  (asLocal(mainSession.endTime));
  // setStartTime(dayjs.utc(mainSession.startTime).format('DD.MM.YYYY HH:mm'));
  // setEndTime  ((mainSession.endTime));

  setEditOpen(true);
};


  const handleSave = async () => {
    if (!startTime || !endTime || !mainSession) return;
    const payload = {
      id: String(mainSession.id),
      groupId: Number(mainSession.groupId),
      startTime: startTime.format('YYYY-MM-DDTHH:mm:ss') + 'Z', 
      endTime: endTime.format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      createdBy: mainSession.createdBy,
      userId: mainSession.userId,
      name,
    };
    console.log(payload)
    await dispatch(updateSessionAction(payload) as any);
    await dispatch(GetSessionByIdAction(Number(sessionId)) as any);
    message.success("Сесію оновлено");
    setEditOpen(false);
  };

  const handleDelete = () => {
    if (!mainSession) return;
    Modal.confirm({
      title: "Видалити сесію?",
      onOk: async () => {
        await dispatch(deleteSessionAction(mainSession.id) as any);
        message.success("Сесію видалено");
        navigate(`/group/${mainSession.groupId}`);
      },
    });
  };

  const openAttendance = async () => {
    // const res = await getAttendanceBySession(Number(sessionId));
    // const { success, payload } = res as any;
  
    // if (success && Array.isArray(payload)) {
    //   console.log("Attendance loaded:", payload);
      setAttendanceOpen(true);
    // } else {
    //   message.error("Не вдалося завантажити відвідуваність.");
    // }
  };
  
 const handlePlanSession = async () => {
  if (!planDate || !planStart || !planEnd || !mainSession?.id) return;

  const payload = {
    sessionId:   Number(mainSession.id),
    plannedDate: planDate.format("YYYY-MM-DD"),   
    startTime:   planStart.format("HH:mm:ss"),
    endTime:     planEnd.format("HH:mm:ss"),
  };

  const res = await dispatch(addPlannedSessionAction(payload) as any);

  if (res.success) {
    message.success("Заплановано нову сесію");
    dispatch(fetchPlannedSessionsBySessionIdAction(Number(mainSession.id)) as any);
    setIsPlanModalOpen(false);
  } else {
    message.error(res.message);
  }
};


  const handleUpdatePlannedSession = async () => {
  if (!selectedEvent || !mainSession) return;

  const plannedDate = dayjs(selectedEvent.start).format("YYYY-MM-DD");
  const startTime = dayjs(selectedEvent.start).format("HH:mm:ss");
  const endTime = dayjs(selectedEvent.end).format("HH:mm:ss");

  const payload = {
    id: selectedEvent.id,
    plannedDate,
    startTime,
    endTime,
    sessionId: mainSession.id,
  };

  const res = await dispatch(updatePlannedSessionAction(payload) as any);
  if (!res.success) return message.error(res.message);
  setSelectedEvent(null);

  if (mainSession?.id) {
    await dispatch(fetchPlannedSessionsBySessionIdAction(Number(mainSession.id)) as any);
  }
  setSelectedEvent(null);
  message.success("Сесію оновлено");
};

const handleDeletePlannedSession = async () => {
  if (!selectedEvent) return;

  await dispatch(deletePlannedSessionAction(selectedEvent.id) as any);
  if (mainSession?.id) {
    await dispatch(fetchPlannedSessionsBySessionIdAction(Number(mainSession.id)) as any);
  }
  setSelectedEvent(null);
  message.success("Сесію видалено");
};


  const openFaceReq = async () => {
    setCheckModalOpen(true);
    const res = await dispatch(fetchPendingFaceRequestsAction(Number(sessionId)) as any);
    setFaceRequests(res?.payload || []);
  };

  const handleApprove = async (id: number) => {
    const res = await dispatch(approveFaceRequestAction(id) as any);
    if (mainSession?.id) {
      await dispatch(fetchPlannedSessionsBySessionIdAction(Number(mainSession.id)) as any);
    }
    if (res.success) setFaceRequests((p) => p.filter((f) => f.id !== id));
  };

  const handleReject = async (id: number) => {
    const res = await dispatch(rejectFaceRequestAction(id) as any);
    if (res.success) setFaceRequests((p) => p.filter((f) => f.id !== id));
  };

  const handleImageClick = (url: string) => setPreviewImage(url);

  if (!mainSession) return <Spin style={{ marginTop: 64 }} size="large" />;

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #e3f0ff 0%, #c6e6fb 100%)",
      paddingTop: 48,
      paddingBottom: 64,
    }}
  >
    <div
      style={{
        maxWidth: 800, 
        margin: "0 auto",
        background: "#fff",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 6px 32px 0 rgba(30,64,175,0.12)",
      }}
    >
      <Title level={3} style={{ color: "#1976d2", fontWeight: 800 }}>
        Сесія: <span className="notranslate">{mainSession.name}</span>
      </Title>
      <p>
        <UserOutlined style={{ marginRight: 8, color: "#1976d2" }} />
        Група: <b className="notranslate">{groupName}</b>
      </p>
      <p>
        <ClockCircleOutlined style={{ marginRight: 8, color: "#1976d2" }} />
        {dayjs.utc(mainSession.startTime).format('DD.MM.YYYY HH:mm')} –{' '}
        {dayjs.utc(mainSession.endTime).format('HH:mm')}
      </p>
      <p>
        Створив: <b className="notranslate">{mainSession.createdBy}</b>
      </p>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 20,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Tooltip title="Запустити сесію">
          <Button shape="circle" type="primary" icon={<PlayCircleOutlined />} onClick={handleStart} />
        </Tooltip>
        <Tooltip title="Редагувати сесію">
          <Button shape="circle" icon={<EditOutlined />} onClick={handleEdit} />
        </Tooltip>
        <Tooltip title="Видалити сесію">
          <Button shape="circle" danger icon={<DeleteOutlined />} onClick={handleDelete} />
        </Tooltip>
        <Tooltip title="Переглянути відвідуваність">
          <Button shape="circle" icon={<TeamOutlined />} onClick={openAttendance} />
        </Tooltip>
        <Tooltip title="Перевірити Face ID-запити">
          <Button shape="circle" icon={<EyeOutlined />} onClick={openFaceReq} />
        </Tooltip>
        <Tooltip title="Запланувати сесію">
          <Button shape="circle" icon={<CalendarOutlined />} onClick={() => setIsPlanModalOpen(true)} />
        </Tooltip>
      </div>

      {/* Календар */}
      <div
        style={{
                maxWidth: 1000,
                margin: "32px auto",
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 0 12px rgba(0,0,0,0.1)",
              }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>Заплановані сесії</Title>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="month"
            style={{ height: 500, width: "100%" }} // ← тут додаємо ширину
            onSelectEvent={(event) => setSelectedEvent(event)}
            messages={{
              today: "Сьогодні",
              next: "→",
              previous: "←",
              month: "Місяць",
              week: "Тиждень",
              day: "День",
              agenda: "Список",
              date: "Дата",
              time: "Час",
              event: "Подія",
              noEventsInRange: "Немає запланованих сесій",
            }}
          />
        </div>
      </div>
    </div>


      


      <Modal title="Редагування сесії" open={editOpen} onCancel={() => setEditOpen(false)} onOk={handleSave}  okText="Зберегти" cancelText="Скасувати" >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Назва сесії"
          style={{ marginBottom: 12 }}
        />
        <DatePicker
          showTime
          style={{ width: "100%", marginBottom: 12 }}
          value={startTime}
          onChange={setStartTime}
        />
        <DatePicker
          showTime
          style={{ width: "100%" }}
          value={endTime}
          onChange={setEndTime}
        />
      </Modal>

      <Modal
        title="Запити Face ID"
        open={checkModalOpen}
        onCancel={() => setCheckModalOpen(false)}
        footer={null}
        centered
        width={600}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 16 }}
      >
        {faceRequests.length ? (
          <List
            dataSource={faceRequests}
            rowKey={keyOf}
            renderItem={(item: any) => (
              <List.Item>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    width: "100%",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 200 }}>
                    <img
                      src={`${APP_ENV.BASE_URL}/images/600_${item.photoFileName}`}
                      alt="Face"
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginRight: 12,
                        cursor: "pointer",
                      }}
                      onClick={() => handleImageClick(`${APP_ENV.BASE_URL}/images/600_${item.photoFileName}`)}
                    />
                    <span style={{ wordBreak: "break-all" } }  className="notranslate" > 
                      {item.name || item.studentId}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button type="primary" onClick={() => handleApprove(item.id)}>
                      Підтвердити
                    </Button>
                    <Button danger onClick={() => handleReject(item.id)}>
                      Відхилити
                    </Button>
                  </div>
                </div>
              </List.Item>
            )}
          />

        ) : (
          <p style={{ textAlign: "center", margin: 0 }}>Немає запитів.</p>
        )}
      </Modal>


      <Modal
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        width={600}
        centered
        styles={{ body: { textAlign: "center" } }}
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="Face"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: 10,
              boxShadow: "0 6px 32px rgba(30,64,175,0.18)",
            }}
          />
        )}
      </Modal>

      <Modal
      title="Відвідуваність"
      open={attendanceOpen}
      onCancel={() => setAttendanceOpen(false)}
      footer={null}
      width="90%"
    >
      {attendanceLoading ? (
        <Spin />
      ) : matrix?.students.length ? (
        <Table
          columns={[
            {
              title: "ПІБ",
              dataIndex: "fullName",
              key: "fullName",
              fixed: "left",
              render: (text: string) => (
              <span className="notranslate">{text}</span>
              ),
            },
            ...matrix.sessions.map(session => ({
               title: (
                <div style={{ display: "flex",  justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <Tooltip title="Редагувати дату">
                    <span
                      style={{ cursor: "pointer", textDecoration: "underline"  }}
                      onClick={() => {
                        setEditSessionHistoryId(session.id);
                        setEditDate(dayjs(session.startTime));
                        setIsEditDateModalOpen(true);
                      }}
                    >
                      {dayjs(session.startTime).format("DD.MM.YYYY")}
                    </span>
                  </Tooltip>
                  <Tooltip title="Видалити дату">
                    <DeleteOutlined
                      style={{ color: "red", cursor: "pointer" }}
                      onClick={async () => {
                        await deleteSessionHistory(session.id);
                        await dispatch(fetchAttendanceMatrixBySessionAction(Number(mainSession.id)) as any);
                      }}
                    />
                  </Tooltip>
                </div>
              ),
              dataIndex: session.id.toString(),
              key: session.id.toString(),
              align: "center" as const,
              render: (_: any, student: any) => {
                const record = matrix.attendances.find(
                  a => a.sessionHistoryId === session.id && a.studentId === student.id
                );

                const value = record ? (record.isPresent ? "✓" : "н") : "н";

                return (
                  <button
                    onClick={async () => {
                      const sessionHistoryId = session.id; 
                      const timestamp = session.startTime;

                      if (record?.id) {
                        await dispatch(deleteAbsenceAction(record.id) as any);
                      } else {
                        // console.log(student.id)
                        // console.log(sessionHistoryId)
                        // console.log(timestamp)
                        await dispatch(addAbsenceAction(student.id, sessionHistoryId, timestamp) as any);
                      }

                      await dispatch(fetchAttendanceMatrixBySessionAction(Number(mainSession.id)) as any);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: value === "✓" ? "green" : "red",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    {value}
                  </button>
                );
              },
            })),
          ]}
          dataSource={matrix.students.map((s: any) => ({
            id: s.id,
            fullName: s.fullName,
          }))}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      ) : (
        <p>Немає даних про відвідуваність</p>
      )}
    </Modal>
    <Modal
        title="Запланувати сесію"
        open={isPlanModalOpen}
        onCancel={() => setIsPlanModalOpen(false)}
        onOk={handlePlanSession}
        okText="Запланувати"
      >
        <DatePicker
          style={{ width: "100%", marginBottom: 12 }}
          value={planDate}
          onChange={setPlanDate}
          placeholder="Дата сесії"
        />
        <DatePicker
          showTime
          format="HH:mm"
          style={{ width: "100%", marginBottom: 12 }}
          value={planStart}
          onChange={setPlanStart}
          placeholder="Час початку"
          picker="time"
        />
        <DatePicker
          showTime
          format="HH:mm"
          style={{ width: "100%" }}
          value={planEnd}
          onChange={setPlanEnd}
          placeholder="Час завершення"
          picker="time"
        />
    </Modal>

    <Modal
      title="Редагувати сесію"
      open={!!selectedEvent}
      onCancel={() => setSelectedEvent(null)}
      footer={[
        <Button key="delete" danger onClick={handleDeletePlannedSession}>
          Видалити
        </Button>,
        <Button key="cancel" onClick={() => setSelectedEvent(null)}>
          Скасувати
        </Button>,
        <Button key="save" type="primary" onClick={handleUpdatePlannedSession}>
          Зберегти
        </Button>,
      ]}
    >
      <p>Сесія: <b>{selectedEvent?.title}</b></p>

      {/* Дата */}
      <DatePicker
        style={{ width: "100%", marginBottom: 12 }}
        value={selectedEvent ? dayjs(selectedEvent.start) : null}
        onChange={(value) =>
          setSelectedEvent((prev: any) => ({
            ...prev,
            start: value
              ? dayjs(value)
                  .hour(dayjs(prev.start).hour())
                  .minute(dayjs(prev.start).minute())
                  .second(dayjs(prev.start).second())
                  .toDate()
              : prev.start,
            end: value
              ? dayjs(value)
                  .hour(dayjs(prev.end).hour())
                  .minute(dayjs(prev.end).minute())
                  .second(dayjs(prev.end).second())
                  .toDate()
              : prev.end,
          }))
        }
        placeholder="Дата"
      />

      {/* Час початку */}
      <DatePicker
        picker="time"
        format="HH:mm"
        style={{ width: "100%", marginBottom: 12 }}
        value={selectedEvent ? dayjs(selectedEvent.start) : null}
        onChange={(value) =>
          setSelectedEvent((prev: any) => ({
            ...prev,
            start: value
              ? dayjs(prev.start)
                  .hour(dayjs(value).hour())
                  .minute(dayjs(value).minute())
                  .second(0)
                  .toDate()
              : prev.start,
          }))
        }
        placeholder="Час початку"
      />

      {/* Час завершення */}
      <DatePicker
        picker="time"
        format="HH:mm"
        style={{ width: "100%" }}
        value={selectedEvent ? dayjs(selectedEvent.end) : null}
        onChange={(value) =>
          setSelectedEvent((prev: any) => ({
            ...prev,
            end: value
              ? dayjs(prev.end)
                  .hour(dayjs(value).hour())
                  .minute(dayjs(value).minute())
                  .second(0)
                  .toDate()
              : prev.end,
          }))
        }
        placeholder="Час завершення"
      />
    </Modal>

    <Modal
      title="Редагувати дату сесії"
      open={isEditDateModalOpen}
      onCancel={() => setIsEditDateModalOpen(false)}
      onOk={async () => {
        if (editSessionHistoryId && editDate && matrix?.sessions) {
          const isDuplicate = matrix.sessions.some(
            (s) =>
              s.id !== editSessionHistoryId &&
              dayjs(s.startTime).isSame(editDate, "day")
          );

          if (isDuplicate) {
            message.error("Сесія з такою датою вже існує.");
            return;
          }

          const response = await updateSessionHistoryDate(
            editSessionHistoryId,
            editDate.toISOString()
          );
          const { success, message: msg } = response as any;

          if (success) {
            message.success("Дату оновлено");
            await dispatch(fetchAttendanceMatrixBySessionAction(Number(mainSession.id)) as any);
            setIsEditDateModalOpen(false);
          } else {
            message.error(msg);
          }
        }
      }}
      okText="Зберегти"
    >
      <DatePicker
        value={editDate}
        onChange={setEditDate}
        style={{ width: "100%" }}
      />
    </Modal>



    </div>
  );
};

export default SessionDetails;
