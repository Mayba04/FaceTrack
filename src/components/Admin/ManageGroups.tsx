import React, { useEffect, useState } from "react";
import { Input, Button, Table, Typography, Space, Modal, Form, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchFilteredGroupsAction, createGroupAction, deleteGroupAction,} from "../../store/action-creators/groupActions";
import type { Group } from "../../store/reducers/GroupReducer/types";

const { Title } = Typography;

const ManageGroups: React.FC = () => {
  const dispatch = useDispatch<any>();

  const { groups, loading, totalCount, pageSize, currentPage } = useSelector(
    (state: RootState) => state.GroupReducer
  );

  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [page, setPage] = useState(1);

  const [isAddVisible, setIsAddVisible] = useState(false);
  const [addForm] = Form.useForm();

  useEffect(() => {
    handleSearch();
  }, [page]);

  const handleSearch = () => {
    dispatch(
      fetchFilteredGroupsAction({
        name: name || null,
        teacherName: teacher || null,
        pageNumber: page,
        pageSize: 10,
      })
    );
  };

  const handleCreate = () => {
    addForm.validateFields().then(async (values) => {
      const { name, teacherId } = values;
      const res = await dispatch(createGroupAction(name, teacherId));
      if (res?.success !== false) {
        message.success("Group created");
        setIsAddVisible(false);
        addForm.resetFields();
        handleSearch();
      }
    });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete group?",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: async () => {
        await dispatch(deleteGroupAction(id));
        handleSearch();
      },
    });
  };

    const columns = [
    { title: "Group", dataIndex: "name", key: "name" },
    { title: "Teacher", dataIndex: "teacherName", key: "teacherName" },
    { title: "Students", dataIndex: "studentsCount", key: "studentsCount" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Group) => (
        <Button type="link" danger onClick={() => handleDelete(record.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Manage Groups</Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Teacher Name"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
        />
        <Button type="primary" onClick={handleSearch} loading={loading}>
          Search
        </Button>
        <Button type="dashed" onClick={() => setIsAddVisible(true)}>
          Create Group
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={groups}
        rowKey={(g: Group) => g.id}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title="Create Group"
        open={isAddVisible}
        onCancel={() => setIsAddVisible(false)}
        onOk={handleCreate}
        okText="Create"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: "Enter name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="teacherId"
            label="Teacher Id"
            rules={[{ required: true, message: "Enter teacherId" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageGroups;