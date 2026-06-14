import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../supabaseClient";

const { Title } = Typography;

export const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });
  }, []);

  const onFinish = async ({ password }: { password: string }) => {
    setLoading(true);
    try {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      message.success("סיסמה עודכנה בהצלחה");
      navigate("/login");
    } catch {
      message.error("שגיאה בעדכון הסיסמה");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>הגדרת סיסמה חדשה</Title>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="password" label="סיסמה חדשה" rules={[{ required: true, min: 8 }]}>
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="אימות סיסמה"
              dependencies={["password"]}
              rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) return Promise.resolve();
                    return Promise.reject(new Error("הסיסמאות אינן תואמות"));
                  },
                }),
              ]}
            >
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                שמור סיסמה
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
