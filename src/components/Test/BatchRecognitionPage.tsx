import React, { useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  List,
  Row,
  Typography,
  message,
  Statistic,
} from "antd";
import { testBatchRecognition } from "../../services/api-facetrack-service";

const { Title } = Typography;

const BatchRecognitionPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [count, setCount] = useState<number>(5);
  const [userId, setUserId] = useState<string>("");
  const [shots, setShots] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => message.error("Помилка доступу до камери: " + err));
  };

  const takeSnapshot = async (): Promise<File> => {
    if (!videoRef.current) throw new Error("Камера не активна");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const blob = await fetch(canvas.toDataURL("image/jpeg")).then((r) => r.blob());
    return new File([blob], `shot-${Date.now()}.jpg`, { type: "image/jpeg" });
  };

  const handleTakePhoto = async () => {
    if (!userId) return message.warning("Введіть userId");
    try {
      const file = await takeSnapshot();
      setShots((prev) => (prev.length < count ? [...prev, file] : prev));
    } catch {
      message.error("Не вдалося зробити знімок");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const limitedFiles = files.slice(0, count - shots.length);
    setShots((prev) => [...prev, ...limitedFiles]);
    e.target.value = "";
  };

  const handleSendBatch = async () => {
    if (shots.length !== count) {
      return message.warning(`Зроблено лише ${shots.length} з ${count} фото`);
    }

    setLoading(true);
    try {
      const { success, payload, message: msg } = (await testBatchRecognition(shots, userId)) as any;
      if (success && payload?.results) {
        setStats(payload.stats);
        setResults(payload.results);
        message.success("Розпізнавання завершено");
      } else {
        message.error(msg || "Невідома помилка");
      }
    } catch {
      message.error("Помилка при запиті");
    } finally {
      setLoading(false);
      setShots([]);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1300, margin: "0 auto" }}>
      <Title level={3}>🧪 Тест розпізнавання облич</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card>
            <video
              ref={videoRef}
              autoPlay
              muted
              style={{ width: "100%", aspectRatio: "4/3", borderRadius: 8 }}
            />
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              <InputNumber
                min={1}
                max={100}
                value={count}
                onChange={(v) => setCount(v || 1)}
                addonBefore="Кадрів"
              />
              <Input
                placeholder="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value.trim())}
                style={{ width: 200 }}
              />
              <Button onClick={startVideo}>🎥 Камера</Button>
              <Button onClick={handleTakePhoto} disabled={shots.length >= count || loading}>
                📸 Зробити фото {shots.length}/{count}
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={shots.length >= count || loading}>
                📁 Завантажити фото
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileUpload}
              />
              <Button
                type="primary"
                onClick={handleSendBatch}
                disabled={shots.length !== count || loading}
                loading={loading}
              >
                🚀 Відправити
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Результати" bodyStyle={{ padding: 0 }}>
            <div style={{ maxHeight: "70vh", overflowY: "auto", padding: 16 }}>
              {stats && (
                <div style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}><Statistic title="Всього фото" value={stats.total} /></Col>
                    <Col span={12}><Statistic title="Співпадінь (Matched)" value={stats.matched} /></Col>
                    <Col span={12}><Statistic title="Нові вектори" value={stats.newVectors} /></Col>
                    <Col span={12}><Statistic title="Без обличчя" value={stats.noFaceDetected} /></Col>
                    <Col span={12}><Statistic title="Без ембеддингу" value={stats.noEmbedding} /></Col>
                    <Col span={12}><Statistic title="Точність (%)" value={`${stats.accuracy}%`} /></Col>
                  </Row>
                </div>
              )}
              <List
                grid={{ gutter: 12, column: 3 }}
                dataSource={results}
                locale={{ emptyText: "Немає результатів" }}
                renderItem={(item: any) => {
                  const b64 = item.imageBase64 ?? item.ImageBase64;
                  const src = b64?.startsWith("data:image") ? b64 : `data:image/jpeg;base64,${b64}`;
                  return (
                    <List.Item>
                      <Card bodyStyle={{ padding: 8, textAlign: "center" }}>
                        {b64 ? (
                          <img src={src} alt="face" width={80} style={{ borderRadius: 4 }} />
                        ) : (
                          <div style={{ width: 80, textAlign: "center" }}>—</div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <b>{item.status ?? item.Status}</b>
                          {item.fullName && ` — ${item.fullName}`}
                        </div>
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BatchRecognitionPage;
