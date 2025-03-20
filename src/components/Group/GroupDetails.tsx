import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Typography, Spin, List, Modal, DatePicker, message, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchGroupByIdAction } from "../../store/action-creators/groupActions";
import { fetchStudentByGroupIdAction, addStudentToGroupAction } from "../../store/action-creators/userActions";
import { fetchSessionsAction, createSessionAction, updateSessionAction, deleteSessionAction } from "../../store/action-creators/sessionAction";
import dayjs from "dayjs";    
import { useNavigate } from "react-router-dom";
import { getAttendanceBySession } from "../../services/api-attendance-service";

const { Title } = Typography;

const GroupDetails: React.FC = () => {
    const { groupId } = useParams<{ groupId: string | undefined }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const groupDetails = useSelector((state: RootState) => state.GroupReducer.group);
    const loading = useSelector((state: RootState) => state.GroupReducer.loading);
    const sessions = useSelector((state: RootState) => state.SessionReducer.sessions);
    const sessionsLoading = useSelector((state: RootState) => state.SessionReducer.loading);
    const user = useSelector((state: RootState) => state.UserReducer.user);
    const students = useSelector((state: RootState) => state.UserReducer.users || []);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); 
    const [email, setEmail] = useState(""); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
    const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
    const [currentSession, setCurrentSession] = useState<any>(null);
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [attendanceList, setAttendanceList] = useState<any[]>([]);

    useEffect(() => {
        console.log(groupId)
        if (groupId) {
            dispatch(fetchGroupByIdAction(Number(groupId)));
            dispatch(fetchSessionsAction(Number(groupId) as any));
            dispatch(fetchStudentByGroupIdAction(Number(groupId)));
        }
    }, [groupId, dispatch]);

    useEffect(() => {
        console.log('Loading state changed:', loading); 
    }, [loading]);

    const showEmailModal = () => {
        setIsEmailModalOpen(true);
    };

    const handleEmailCancel = () => {
        setIsEmailModalOpen(false);
        setEmail(""); 
    };

    const handleViewAttendance = async (sessionId: number) => {
        const response = await getAttendanceBySession(sessionId);
        const { success, payload } = response as any;
        if (success && Array.isArray(payload)) {
            console.log(payload)
          setAttendanceList(payload);
          setAttendanceModalOpen(true);
        } else {
          message.error("Failed to load attendance data.");
        }
      };

    const handleAddStudent = async () => {
        if (!email) {
            message.warning("Please enter a valid email.");
            return;
        }

        await dispatch(addStudentToGroupAction(email, Number(groupId)));
        await dispatch(fetchStudentByGroupIdAction(Number(groupId)));
        message.success(`Student with email ${email} added successfully!`);
        setIsEmailModalOpen(false);
        setEmail(""); 
    };

    const showModal = (session?: any) => {
        setIsModalOpen(true);
        if (session) {
            setCurrentSession(session);
            setStartTime(dayjs(session.startTime));
            setEndTime(dayjs(session.endTime));
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setStartTime(null);
        setEndTime(null);
        setCurrentSession(null);
    };

    const handleSaveSession = async () => {
        if (!groupId || !user?.fullName || !startTime || !endTime) {
            message.warning("Please fill all fields.");
            return;
        }

        const sessionData = {
            id: currentSession?.id || 0,
            groupId: Number(groupId),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            createdBy: `${user.fullName} ${groupDetails?.name}`,
            userId: user.id
        };

        if (currentSession) {
            await dispatch(updateSessionAction(sessionData as any));
            message.success("Session updated successfully!");
        } else {
            await dispatch(createSessionAction(sessionData));
            console.log(loading);
            message.success("Session created successfully!");
        }

        handleCancel();
    };

    const handleDeleteSession = (id: number) => {
        Modal.confirm({
            title: "Are you sure you want to delete this session?",
            onOk: async () => {
                await dispatch(deleteSessionAction(id as any));
                await dispatch(fetchSessionsAction(Number(groupId) as any));
                message.success("Session deleted successfully!");
            }
        });
    };


    const handleStartSession = (sessionId: number) => {
        navigate(`/session/${sessionId}`);
    };

    if (!groupDetails) return <Title level={3} style={{ textAlign: "center", marginTop: "20px" }}>Group not found</Title>;

    return (
   
        <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
                <Title level={2} style={{ textAlign: "center" }}>
                    {groupDetails.name} - Details
                </Title>

                <Card title="Students" style={{ marginBottom: "20px" }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={showEmailModal} style={{ marginBottom: "10px" }}>
                        Add Student
                    </Button>
                    {students.length > 0 ? (
                        <List
                            bordered
                            dataSource={students}
                            renderItem={(student) => (
                                <List.Item>
                                    {student.fullName} ({student.email})
                                </List.Item>
                            )}
                        />
                    ) : (
                        <p>No students in this group.</p>
                    )}
                </Card>

                <Card title="Sessions">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: "10px" }}>
                        Create Session
                    </Button>
                    {sessionsLoading ? (
                        <Spin size="small" />
                    ) : (
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
                                    <b>ID:</b> {session.id} | <b>Created By:</b> {session.createdBy} |
                                    <b> Start:</b> {dayjs(session.startTime).format("YYYY-MM-DD HH:mm")} |
                                    <b> End:</b> {dayjs(session.endTime).format("YYYY-MM-DD HH:mm")}
                                </span>
                            
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <Button type="primary" onClick={() => handleStartSession(Number(session.id))}>Start Session</Button>
                                    <Button icon={<EditOutlined />} onClick={() => showModal(session)} />
                                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteSession(Number(session.id))} />
                                    <Button onClick={() => handleViewAttendance(Number(session.id))}>View Attendance</Button>
                                </div>
                            </List.Item>
                            )}
                        />
                    )}
                </Card>
            </Card>

            <Modal
                title="Add Student"
                open={isEmailModalOpen}
                onCancel={handleEmailCancel}
                onOk={handleAddStudent}
                okText="Add"
                cancelText="Cancel"
                centered
            >
                <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter student email"
                    style={{ width: "100%", marginBottom: "10px" }}
                />
            </Modal>

            <Modal
                title={currentSession ? "Edit Session" : "Create Session"}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSaveSession}
                okText={currentSession ? "Save" : "Create"}
                cancelText="Cancel"
                centered
            >
                <p>Select session start and end time:</p>
                <DatePicker
                    showTime
                    value={startTime}
                    onChange={setStartTime}
                    placeholder="Select start time"
                    style={{ width: "100%", marginBottom: "10px" }}
                />
                <DatePicker
                    showTime
                    value={endTime}
                    onChange={setEndTime}
                    placeholder="Select end time"
                    style={{ width: "100%" }}
                />
            </Modal>

            <Modal
            title="Attendance List"
            open={attendanceModalOpen}
            onCancel={() => setAttendanceModalOpen(false)}
            footer={null}
            centered
            >
            {attendanceList.length > 0 ? (
                <List
                dataSource={attendanceList}
                renderItem={(record) => (
                  <List.Item>
                    {record.user?.fullName || record.studentId}
                  </List.Item>
                )}
              />
              
            ) : (
                <p>No students marked as present.</p>
            )}
            </Modal>


        </div>
    )
};
export default GroupDetails;
