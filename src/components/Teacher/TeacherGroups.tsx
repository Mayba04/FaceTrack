import React, { useEffect, useState } from "react";
import { Button, Modal, Typography, Input, message, Pagination, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  createGroupAction,
  fetchGroupsAction,
  deleteGroupAction,
  updateGroupAction,
} from "../../store/action-creators/groupActions";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const pageSize = 5;

const TeacherGroups: React.FC = () => {
  const teacherId = useSelector((state: RootState) => state.UserReducer.user?.id);
  const groups = useSelector((state: RootState) => state.GroupReducer.groups);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<{ id: number; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (teacherId) {
      dispatch(fetchGroupsAction(teacherId));
    }
  }, [teacherId, dispatch]);

  const handleCreateOrUpdateGroup = async () => {
    if (!newGroupName.trim()) {
      message.warning("Будь ласка, введіть назву групи");
      return;
    }

    try {
      if (editingGroup) {
        await dispatch(updateGroupAction(editingGroup.id, newGroupName, teacherId!));
        message.success("Групу успішно оновлено!");
      } else {
        await dispatch(createGroupAction(newGroupName, teacherId!));
        message.success("Групу успішно створено!");
      }
      setIsModalOpen(false);
      setNewGroupName("");
      setEditingGroup(null);
      dispatch(fetchGroupsAction(teacherId as any));
    } catch {
      message.error("Сталася помилка.");
    }
  };

  const handleEdit = (group: { id: number; name: string }) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setIsModalOpen(true);
  };

  const handleDelete = async (groupId: number) => {
    try {
        await dispatch(deleteGroupAction(groupId));
        message.success("Групу успішно видалено!");
    } catch (error) {
        console.error("Failed to delete group: ", error);
        message.error("Не вдалося видалити групу.");
    }
};

  const paginatedGroups = groups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
          maxWidth: 700,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          padding: 32,
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
          Мої групи
        </Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalOpen(true);
            setEditingGroup(null);
            setNewGroupName("");
          }}
          block
          style={{
            marginBottom: 28,
            height: 42,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Створити нову групу
        </Button>

        {paginatedGroups.map((group) => (
          <div
            key={group.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderRadius: 12,
              background: "#f6fafd",
              marginBottom: 16,
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1e293b",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <span className="notranslate">{group.name}</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Button icon={<EditOutlined />} onClick={() => handleEdit(group)}>
                Редагувати
              </Button>
              <Popconfirm
                title="Ви впевнені, що хочете видалити цю групу?"
                onConfirm={() => handleDelete(group.id)}
                okText="Так"
                cancelText="Ні"
              >
                <Button icon={<DeleteOutlined />} danger>
                  Видалити
                </Button>
              </Popconfirm>
            </div>
          </div>
        ))}

        <div
        style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 24,
        }}
        >
        <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={groups.length}
            onChange={setCurrentPage}
        />
        </div>


      </div>

      <Modal
        title={editingGroup ? "Редагувати групу" : "Створити групу"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreateOrUpdateGroup}
        okText={editingGroup ? "Оновити" : "Створити"}
        cancelText="Скасувати"
        centered
      >
        <Input
          placeholder="Введіть назву групи"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default TeacherGroups;
