import { Form, Input, Button, Card, Typography, Space } from "antd";
import { useLogin } from "@refinedev/core";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export const LoginPage = () => {
  const { mutate: login, isLoading } = useLogin();

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 360 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>כניסה למערכת</Title>
          <Form layout="vertical" onFinish={(values) => login(values)}>
            <Form.Item name="email" label="אימייל" rules={[{ required: true, type: "email" }]}>
              <Input type="email" size="large" />
            </Form.Item>
            <Form.Item name="password" label="סיסמה" rules={[{ required: true }]}>
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
                כניסה
              </Button>
            </Form.Item>
            <div style={{ textAlign: "center" }}>
              <Link to="/forgot-password">
                <Text type="secondary">שכחתי סיסמה</Text>
              </Link>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};
