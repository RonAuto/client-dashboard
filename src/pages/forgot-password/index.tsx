import { useState } from "react";
import { Form, Input, Button, Card, Typography, Space, Alert, message } from "antd";
import { Link } from "react-router-dom";
import { supabaseClient } from "../../supabaseClient";

const { Title, Text } = Typography;

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      const { data: registered } = await supabaseClient.rpc("check_email_registered", { email_input: email });
      if (!registered) {
        message.error("כתובת האימייל אינה רשומה במערכת");
        return;
      }
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch {
      message.error("שגיאה בשליחת מייל איפוס");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>איפוס סיסמה</Title>
          {sent ? (
            <Alert message="מייל איפוס נשלח! בדוק את תיבת הדואר שלך." type="success" showIcon />
          ) : (
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item name="email" label="אימייל" rules={[{ required: true, type: "email" }]}>
                <Input type="email" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  שלח מייל איפוס
                </Button>
              </Form.Item>
            </Form>
          )}
          <div style={{ textAlign: "center" }}>
            <Link to="/login"><Text type="secondary">חזרה לכניסה</Text></Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};
