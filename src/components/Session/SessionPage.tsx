import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { detectBase64Video } from "../../services/api-facetrack-service";
import { Container, Row, Col, Card, Spinner, ListGroup, Image } from "react-bootstrap";

interface IFace {
  name: string;
  faceImageBase64: string;
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [recognizedFaces, setRecognizedFaces] = useState<IFace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const captureFrame = async (): Promise<File | null> => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/png");
    const blob = await fetch(base64Image).then((res) => res.blob());
    return new File([blob], "frame.png", { type: "image/png" });
  };

  const processFrame = async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const file = await captureFrame();
      if (!file) return;

      const response = await detectBase64Video(file, Number(sessionId));
      const { faces } = response as any;

      if (Array.isArray(faces)) {
        setRecognizedFaces((prevFaces) => {
            const newFaces = faces.filter(
              (newFace) => !prevFaces.some((prevFace) => prevFace.faceImageBase64 === newFace.faceImageBase64)
            );
            return newFaces.length > 0 ? [...prevFaces, ...newFaces] : prevFaces;
          });          
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    startVideo();
    const interval = setInterval(() => {
      processFrame();
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <Container fluid className="vh-100 py-3 overflow-auto">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-lg p-4">
            <Card.Title className="text-center mb-3">Session {sessionId} - Face Recognition</Card.Title>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-100 rounded mb-3"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />

            <Card className="mt-3">
              <Card.Header className="text-center">Recognized Faces</Card.Header>
              <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                {loading && recognizedFaces.length === 0 ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : recognizedFaces.length > 0 ? (
                  <ListGroup>
                    {recognizedFaces.map((face, index) => (
                      <ListGroup.Item key={index} className="d-flex align-items-center">
                        <Image
                          src={`data:image/jpeg;base64,${face.faceImageBase64}`}
                          roundedCircle
                          width={50}
                          height={50}
                          className="me-3"
                        />
                        <span>{face.name}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-center text-muted">No faces recognized yet.</p>
                )}
              </Card.Body>
            </Card>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SessionPage;