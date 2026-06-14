import { Card, Col, Row, Typography } from "antd";

const { Title } = Typography;

export const DashboardPage = () => (
  <Row gutter={[16, 16]}>
    <Col span={24}>
      <Title level={3}>לוח בקרה</Title>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card>ממתין לנתונים</Card>
    </Col>
  </Row>
);
