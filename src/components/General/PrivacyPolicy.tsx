import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

const PrivacyPolicy: React.FC = () => (
  <div style={{
    minHeight: "100vh",
    background: "#f9fbff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
    <Card
      style={{
        maxWidth: 600,
        width: "100%",
        padding: 32,
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)"
      }}
    >
      <Title level={2} style={{ textAlign: "center" }}>
        Політика обробки фото та біометричних даних
      </Title>

      <Paragraph>
        Для ідентифікації під час відмічання присутності система використовує фото, зроблені з вебкамери, а також біометричні вектори обличчя.
      </Paragraph>
      <Paragraph>
        <b>Як використовуються ваші дані?</b><br />
        Фото та біометричні дані використовуються <u>виключно для автоматизованої ідентифікації при відмічанні присутності</u>.
        Дані не передаються стороннім особам і не доступні для редагування або видалення користувачем.
      </Paragraph>
      <Paragraph>
        <b>Видалення даних:</b><br />
        Видалення ваших фото та векторів можливе <u>тільки адміністратором системи</u> згідно з регламентом.
      </Paragraph>
    </Card>
  </div>
);

export default PrivacyPolicy;
