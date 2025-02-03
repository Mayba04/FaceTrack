import React, { useRef, useState, useEffect } from "react";
import { detectBase64Video } from "../services/face-recognition-service";

// Тип, щоб було зручно з TypeScript
interface IFace {
  name: string;
  faceImageBase64: string;
}

const RealTimeFaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Тут зберігаємо масив облич, які повернув бекенд
  const [recognizedFaces, setRecognizedFaces] = useState<IFace[]>([]);

  // Функція для запуску відео з вебкамери
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

  // Функція, яка знімає кадр і надсилає його на бекенд
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Робимо canvas такого ж розміру, як і відео
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Малюємо кадр з <video> у canvas (тимчасово)
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Отримуємо DataURL (base64 зображення)
    const base64Image = canvas.toDataURL("image/png");

    // Робимо з нього File, щоб відправити як FormData
    const file = await fetch(base64Image)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new File([blob], "frame.png", {
            type: "image/png",
          })
      );

    try {
      // Викликаємо ваш сервіс (axios) для звернення до бекенду
      const response = await detectBase64Video(file);

      // Бекенд має структуру: { message: string, faces: IFace[] }
      const { faces } = response as any; // Перевірте регістр: у вас "faces" чи "Faces"?

      // Перевіряємо, чи об’єкт faces існує і є масивом
      if (Array.isArray(faces)) {
        // Оновлюємо стан recognizedFaces
        setRecognizedFaces(faces);
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  };

  // Викликаємо startVideo() один раз, коли компонент монтується
  // І ставимо інтервал, наприклад, 1 раз на 5 секунд
  useEffect(() => {
    startVideo();
    const interval = setInterval(() => {
      processFrame();
    }, 5000);

    // При демонтуванні компонента інтервал очищається
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Блок з відео + прихований canvas */}
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: "640px",
            height: "480px",
            border: "1px solid black",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            display: "none", // не показуємо canvas
          }}
        />
      </div>

      {/* Блок, де показуємо список розпізнаних облич (name + mini-photo) */}
      <div>
        <h3>Recognized Faces</h3>
        {recognizedFaces.map((face, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p>Name: {face.name}</p>

            {/* Якщо faceImageBase64 не порожнє, відображаємо <img> */}
            {face.faceImageBase64 && face.faceImageBase64.length > 0 && (
              <img
                src={`data:image/jpeg;base64,${face.faceImageBase64}`}
                alt={face.name}
                style={{ width: "100px", height: "auto" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeFaceRecognition;
