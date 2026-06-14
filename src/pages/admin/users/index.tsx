import { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message, Card, Typography } from "antd";
import { useList } from "@refinedev/core";
import { supabaseClient } from "../../../supabaseClient";

const { Title } = Typography;

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export const AdminUsersPage = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [resendTarget, setResendTarget] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useList<Profile>({
    resource: "profiles",
    meta: { select: "*" },
  });

  const handleInvite = async (values: { email: string; role: string }) => {
    setInviteLoading(true);
    try {
      const res = await supabaseClient.functions.invoke("invite-user", { body: values });
      const result = res.data;

      if (result?.error === "ALREADY_REGISTERED") {
        message.error("משתמש זה כבר רשום במערכת");
        return;
      }
      if (result?.error === "ALREADY_INVITED") {
        setInviteModalOpen(false);
        setResendTarget(values.email);
        return;
      }
      if (result?.error) {
        message.error(result.error);
        return;
      }

      message.success("הזמנה נשלחה בהצלחה");
      setInviteModalOpen(false);
      form.resetFields();
      refetch();
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResend = async () => {
    if (!resendTarget) return;
    setInviteLoading(true);
    try {
      await supabaseClient.functions.invoke("invite-user", {
        body: { email: resendTarget, role: "user" },
      });
      message.success("הזמנה נשלחה מחדש");
      setResendTarget(null);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await supabaseClient.functions.invoke("delete-user", {
        body: { user_id: userId },
      });
      if (res.data?.error) { message.error(res.data.error); return; }
      message.success("משתמש נמחק");
      refetch();
    } catch {
      message.error("שגיאה במחיקת המשתמש");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    const { error } = await supabaseClient.from("profiles").update({ role }).eq("id", userId);
    if (error) message.error("שגיאה בעדכון תפקיד");
    else { message.success("תפקיד עודכן"); refetch(); }
  };

  const columns = [
    { title: "אימייל", dataIndex: "email", key: "email" },
    {
      title: "תפקיד",
      dataIndex: "role",
      key: "role",
      render: (role: string, record: Profile) => (
        <Select
          value={role}
          size="small"
          onChange={(val) => handleRoleChange(record.id, val)}
          options={[{ value: "user", label: "משתמש" }, { value: "admin", label: "מנהל" }]}
        />
      ),
    },
    {
      title: "סטטוס",
      key: "status",
      render: () => <Tag color="green">פעיל</Tag>,
    },
    {
      title: "פעולות",
      key: "actions",
      render: (_: unknown, record: Profile) => (
        <Popconfirm
          title="למחוק משתמש זה?"
          onConfirm={() => handleDelete(record.id)}
          okText="מחק"
          cancelText="ביטול"
        >
          <Button danger size="small">מחק</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={4} style={{ margin: 0 }}>ניהול משתמשים</Title>
            <Button type="primary" onClick={() => setInviteModalOpen(true)}>הזמן משתמש</Button>
          </div>
          <Table dataSource={data?.data} columns={columns} rowKey="id" loading={isLoading} />
        </Space>
      </Card>

      <Modal
        title="הזמנת משתמש חדש"
        open={inviteModalOpen}
        onCancel={() => { setInviteModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleInvite}>
          <Form.Item name="email" label="אימייל" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="תפקיד" initialValue="user">
            <Select options={[{ value: "user", label: "משתמש" }, { value: "admin", label: "מנהל" }]} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={inviteLoading} block>שלח הזמנה</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="משתמש כבר הוזמן"
        open={!!resendTarget}
        onCancel={() => setResendTarget(null)}
        onOk={handleResend}
        okText="שלח שוב"
        cancelText="ביטול"
        confirmLoading={inviteLoading}
      >
        <p>משתמש עם כתובת {resendTarget} כבר קיבל הזמנה אך טרם הצטרף. לשלוח הזמנה מחדש?</p>
      </Modal>
    </>
  );
};
