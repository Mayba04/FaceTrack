import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message, Spin, Card, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { createGroupAction, fetchGroupsAction } from "../../store/action-creators/groupActions";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TeacherGroups: React.FC = () => {
    const teacherId = useSelector((state: RootState) => state.UserReducer.user?.id);
    const groups = useSelector((state: RootState) => state.GroupReducer.groups);
    const loading = useSelector((state: RootState) => state.GroupReducer.loading);
    const dispatch = useDispatch<AppDispatch>();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState<string>("");

    useEffect(() => {
        if (teacherId) {
            dispatch(fetchGroupsAction(teacherId));
        }
    }, [teacherId, dispatch]);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            message.warning("Please enter a group name.");
            return;
        }

        try {
            await dispatch(createGroupAction(newGroupName, teacherId!));
            setIsModalOpen(false);
            setNewGroupName("");
            message.success("Group successfully created!");
            dispatch(fetchGroupsAction(teacherId as any));
        } catch (error) {
            console.error("Failed to create group: ", error);
        }
    };

    const columns = [
        {
            title: "Group Name",
            dataIndex: "name",
            key: "name",
        },
    ];

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
                <Title level={2} style={{ textAlign: "center" }}>My Groups</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsModalOpen(true)} 
                    style={{ width: "100%", marginBottom: "20px", height: "40px", fontSize: "16px" }}
                >
                    Create New Group
                </Button>

                {loading ? (
                    <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "20px" }} />
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={groups} 
                        rowKey="id" 
                        pagination={{ pageSize: 5 }} 
                        style={{ borderRadius: "8px", overflow: "hidden" }} 
                    />
                )}

                {/* Modal for creating a group */}
                <Modal
                    title="Create a Group"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onOk={handleCreateGroup}
                    okText="Create"
                    cancelText="Cancel"
                    centered
                >
                    <Input
                        placeholder="Enter group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        size="large"
                    />
                </Modal>
            </Card>
        </div>
    );
};

export default TeacherGroups;
