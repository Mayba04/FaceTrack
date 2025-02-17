import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message, Spin, Card, Typography, Space, Popconfirm } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { createGroupAction, fetchGroupsAction, deleteGroupAction, updateGroupAction } from "../../store/action-creators/groupActions";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TeacherGroups: React.FC = () => {
    const teacherId = useSelector((state: RootState) => state.UserReducer.user?.id);
    const groups = useSelector((state: RootState) => state.GroupReducer.groups);
    const loading = useSelector((state: RootState) => state.GroupReducer.loading);
    const dispatch = useDispatch<AppDispatch>();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [editingGroup, setEditingGroup] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        if (teacherId) {
            dispatch(fetchGroupsAction(teacherId));
        }
    }, [teacherId, dispatch]);

    // Створення групи
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

    // Видалення групи
    const handleDeleteGroup = async (groupId: number) => {
        try {
            await dispatch(deleteGroupAction(groupId));
            message.success("Group deleted successfully!");
        } catch (error) {
            console.error("Failed to delete group: ", error);
            message.error("Failed to delete group.");
        }
    };

    // Відкриття модального вікна для редагування
    const handleEditGroup = (group: { id: number; name: string }) => {
        setEditingGroup(group);
        setNewGroupName(group.name);
        setIsModalOpen(true);
    };

    // Оновлення групи
    const handleUpdateGroup = async () => {
        if (!newGroupName.trim() || !editingGroup) {
            message.warning("Please enter a valid group name.");
            return;
        }

        try {
            await dispatch(updateGroupAction(editingGroup.id, newGroupName, teacherId!));
            setIsModalOpen(false);
            setNewGroupName("");
            setEditingGroup(null);
            message.success("Group updated successfully!");
        } catch (error) {
            console.error("Failed to update group: ", error);
            message.error("Failed to update group.");
        }
    };

    const columns = [
        {
            title: "Group Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: { id: number; name: string }) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEditGroup(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this group?"
                        onConfirm={() => handleDeleteGroup(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
            <Card style={{ borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
                <Title level={2} style={{ textAlign: "center" }}>My Groups</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                        setEditingGroup(null);
                        setIsModalOpen(true);
                    }} 
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

                {/* Modal for creating/editing a group */}
                <Modal
                    title={editingGroup ? "Edit Group" : "Create a Group"}
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingGroup(null);
                    }}
                    onOk={editingGroup ? handleUpdateGroup : handleCreateGroup}
                    okText={editingGroup ? "Update" : "Create"}
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
