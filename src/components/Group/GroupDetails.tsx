import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Typography, Spin, List, Modal, DatePicker, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchGroupByIdAction } from "../../store/action-creators/groupActions";
import { fetchSessionsAction, createSessionAction } from "../../store/action-creators/sessionAction";
import dayjs from "dayjs";

const { Title } = Typography;

const GroupDetails: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    
    const groupDetails = useSelector((state: RootState) => state.GroupReducer.group);
    const loading = useSelector((state: RootState) => state.GroupReducer.loading);
    
    const sessions = useSelector((state: RootState) => state.SessionReducer.sessions);
    const sessionsLoading = useSelector((state: RootState) => state.SessionReducer.loading);
    
    const user = useSelector((state: RootState) => state.UserReducer.user); // Ім'я користувача

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
    const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);

    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupByIdAction(Number(groupId)));
            dispatch(fetchSessionsAction(groupId));
        }
    }, [groupId, dispatch]);

    // Відкриття модального вікна
    const showCreateSessionModal = () => {
        setIsModalOpen(true);
    };

    // Закриття модального вікна
    const handleCancel = () => {
        setIsModalOpen(false);
        setStartTime(null);
        setEndTime(null);
    };

    // Створення сесії
    const handleCreateSession = () => {
        if (!groupId || !user?.fullName) {
            message.error("Error: Missing group ID or user name.");
            return;
        }

        if (!startTime || !endTime) {
            message.warning("Please select start and end time.");
            return;
        }

        const sessionData = {
            groupId: Number(groupId),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            createdBy: user.fullName + " " + groupDetails?.name,
            userId: user.id
        };

        dispatch(createSessionAction(sessionData));
        setIsModalOpen(false);
        message.success("Session created successfully!");
    };

    if (loading) {
        return <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "50px" }} />;
    }

    if (!groupDetails) {
        return <Title level={3} style={{ textAlign: "center", marginTop: "20px" }}>Group not found</Title>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
                <Title level={2} style={{ textAlign: "center" }}>{groupDetails.name} - Details</Title>

                {/* Список студентів */}
                <Card title="Students" style={{ marginBottom: "20px" }}>
                    <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: "10px" }}>
                        Add Student
                    </Button>
                    <p>Student list coming soon...</p>
                </Card>

                {/* Список сесій */}
                <Card title="Sessions">
                    <Button type="primary" icon={<PlusOutlined />} onClick={showCreateSessionModal} style={{ marginBottom: "10px" }}>
                        Create Session
                    </Button>

                    {sessionsLoading ? (
                        <Spin size="small" />
                    ) : (
                        <List
                            bordered
                            dataSource={sessions}
                            renderItem={(session) => (
                                <List.Item>
                                    <b>Session ID:</b> {session.id} | <b>Created By:</b> {session.createdBy} | 
                                    <b> Start:</b> {session.startTime ? dayjs(session.startTime).format("YYYY-MM-DD HH:mm") : "N/A"} | 
                                    <b> End:</b> {session.endTime ? dayjs(session.endTime).format("YYYY-MM-DD HH:mm") : "N/A"}
                                </List.Item>
                            )}
                        />
                    )}
                </Card>
            </Card>

            {/* Модальне вікно створення сесії */}
            <Modal
                title="Create Session"
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleCreateSession}
                okText="Create"
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
    );
};

export default GroupDetails;
