import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Typography, Spin, List, Modal, DatePicker, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchGroupByIdAction } from "../../store/action-creators/groupActions";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import { fetchSessionsAction, createSessionAction, updateSessionAction, deleteSessionAction } from "../../store/action-creators/sessionAction";
import dayjs from "dayjs";

const { Title } = Typography;

const GroupDetails: React.FC = () => {
    const { groupId } = useParams<{ groupId: string | undefined }>();
    const dispatch = useDispatch<AppDispatch>();

    const groupDetails = useSelector((state: RootState) => state.GroupReducer.group);
    const loading = useSelector((state: RootState) => state.GroupReducer.loading);
    const sessions = useSelector((state: RootState) => state.SessionReducer.sessions);
    const sessionsLoading = useSelector((state: RootState) => state.SessionReducer.loading);
    const user = useSelector((state: RootState) => state.UserReducer.user);
    const students = useSelector((state: RootState) => state.UserReducer.users || []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
    const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
    const [currentSession, setCurrentSession] = useState<any>(null);

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

    if (!groupDetails) return <Title level={3} style={{ textAlign: "center", marginTop: "20px" }}>Group not found</Title>;

    return (
   
        <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
                <Title level={2} style={{ textAlign: "center" }}>
                    {groupDetails.name} - Details
                </Title>

                <Card title="Students" style={{ marginBottom: "20px" }}>
                    <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: "10px" }}>
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
                                    actions={[
                                        <Button icon={<EditOutlined />} onClick={() => showModal(session)} />,
                                        <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteSession(session.id as any)} />
                                    ]}
                                >
                                    <b>ID:</b> {session.id} | <b>Created By:</b> {session.createdBy} |
                                    <b> Start:</b> {dayjs(session.startTime).format("YYYY-MM-DD HH:mm")} |
                                    <b> End:</b> {dayjs(session.endTime).format("YYYY-MM-DD HH:mm")}
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            </Card>

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
        </div>
    )
};
export default GroupDetails;
