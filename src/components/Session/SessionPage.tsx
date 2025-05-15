import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { detectBase64Video } from "../../services/api-facetrack-service";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { fetchSessionByIdAction } from "../../store/action-creators/sessionAction";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import type { AppDispatch } from "../../store";
import { addedVectorsToStudents, deleteVector } from "../../services/api-faceVectors-service";
import {  Modal, message } from "antd";
import { markStudentsPresent } from "../../services/api-attendance-service";

interface IFace {
  name: string;
  faceImageBase64: string;
  vectorId: number;
  userId?: string;
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const studentsFromStore = useSelector((state: RootState) => state.UserReducer.users);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sessionData = useSelector((state: RootState) => state.SessionReducer.session);
  const [recognizedFaces, setRecognizedFaces] = useState<IFace[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Запускаємо відео
    startVideo();

    // Завантажуємо поточну сесію
    dispatch(fetchSessionByIdAction(Number(sessionId)))
      .catch((err) => {
        console.error("Error fetching session:", err);
      });
      
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (sessionData?.groupId) {
      dispatch(fetchStudentByGroupIdAction(Number(sessionData.groupId)));
    }
  }, [sessionData, dispatch]);

  useEffect(() => {
    // Якщо isCapturing = true, кожні 5с викликаємо processFrame
    if (isCapturing) {
      intervalRef.current = setInterval(processFrame, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // При демонтажі зупиняємо
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapturing]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }).catch((err) => console.error("Error accessing webcam:", err));
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

  const markAttendance = async () => {
    if (!sessionId) return;

    const attendanceData = recognizedFaces
      .filter((face) => face.name !== "Unknown" && face.userId) 
      .map((face) => ({
        sessionId: Number(sessionId),
        studentId: face.userId, 
      }));

    if (attendanceData.length === 0) {
      message.warning("There are no recognized students to mark.");
      return;
    }

    if (attendanceData.length === 0) {
        message.warning("There are no recognized students to mark.");
        return;
    }

    const studentNames = recognizedFaces
        .filter((face) => face.name !== "Unknown" && face.userId)
        .map((face) => face.name)
        .join(", ");

    Modal.confirm(
    {
      title: "Confirmation of presence check-in",
      content: `Are you sure you want to tag the following students: ${studentNames}?`,
      okText: "Yes, mark",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await markStudentsPresent(attendanceData);
          console.log(response);
        
          const { success, message: serverMessage } = response as any;
        
          if (success) {
            message.success("Students have been successfully marked as present!"); 
          } else {
            console.error("Server error while marking attendance:", serverMessage);
            message.error("Error while checking presence.");
          }
        } catch (error) {
          console.error("Unexpected error marking attendance:", error);
          message.error("Unexpected error, please try again.");
        }
        
      },
    });
  };


  const processFrame = async () => {
    setLoading(true);
    try {
      const file = await captureFrame();
      if (!file) return;
  
      const response = await detectBase64Video(file, Number(sessionId));
      const { faces } = response as any;
  
      if (Array.isArray(faces)) {
        setRecognizedFaces((prevFaces) => {
          const existingVectorIds = new Set(prevFaces.map((face) => face.vectorId));
          const existingUserIds = new Set(prevFaces.map((face) => face.userId));
  
          
          const newFaces = faces.filter((newFace: IFace) => {
            if (existingVectorIds.has(newFace.vectorId)) return false;
  
            if (newFace.userId && existingUserIds.has(newFace.userId)) return false;
  
            return true;
          });
  
          return newFaces.length > 0 ? [...prevFaces, ...newFaces] : prevFaces;
        });
      }
    } catch (err) {
      console.error("Error processing frame:", err);
    } finally {
      setLoading(false);
    }
  };
  

  const toggleCapture = () => {
    setIsCapturing((prev) => !prev);
  };

  const handleAssignStudent = (vectorId: number, studentId: string) => {
    setRecognizedFaces((prev) =>
      prev.map((face) =>
        face.vectorId === vectorId ? { ...face, userId: studentId } : face
      )
    );
  };
  

  const handleRemoveFace = async (vectorId: number) => {
    if (!vectorId) return;
  
    try {
      const response = await deleteVector(vectorId);
      const { success } = response as any;
      setRecognizedFaces((prev) =>
        prev.filter((face) => face.vectorId !== vectorId)
      );
  
      if (!success) {
        console.warn("Сервер не видалив вектор, але інтерфейс оновлено.");
      }
    } catch  {
      console.warn("Помилка при видаленні з сервера, вектор прибрано локально.");
      setRecognizedFaces((prev) =>
        prev.filter((face) => face.vectorId !== vectorId)
      );
    }
  };

  const saveVectors = async () => {
    try {
      const assignmentData = recognizedFaces
        .filter((face) => face.name === "Unknown" && face.userId)
        .map((face) => ({
          vectorId: face.vectorId,
          studentId: face.userId
        }));

      if (assignmentData.length === 0) {
        message.error("Немає вибраних невідомих облич для збереження.")
        return;
      }

      await addedVectorsToStudents(assignmentData);

      setRecognizedFaces((prev) =>
        prev.map((face) => {
          if (face.name === "Unknown" && face.userId) {
            const st = studentsFromStore.find((s) => s.id === face.userId);
            if (st) {
              return { ...face, name: st.fullName };
            }
          }
          return face;
        })
      );

      message.success("Vectors saved successfully!");
    } catch (error) {
      console.error("Error saving vectors:", error);
      message.error("Error saving vectors!");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "92.5dvh",
        background: "linear-gradient(120deg, #e3f0ff 0%, #c6e6fb 100%)",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "auto" }}>
        <div
          className="bg-white p-4 rounded shadow-sm"
          style={{
            borderRadius: 20,
            boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
          }}
        >
          <h3 className="text-center mb-4" style={{ color: "#003366", fontWeight: 700 }}>
            📸 Face Recognition — Session #{sessionId}
          </h3>
  
          <div className="row gy-4">
            {/* Блок відео */}
            <div className="col-12 col-lg-8">
              <div
                className="p-3 rounded"
                style={{
                  borderLeft: "5px solid #1890ff",
                  background: "#fff",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-100 rounded"
                  style={{
                    maxHeight: "460px",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
                />
                <div className="d-flex justify-content-center flex-wrap gap-3 mt-3">
                  <button
                    className={`btn ${isCapturing ? "btn-danger" : "btn-success"}`}
                    onClick={toggleCapture}
                  >
                    {isCapturing ? "⏹️ Stop Capturing" : "▶️ Start Capturing"}
                  </button>
                  <button className="btn btn-primary" onClick={markAttendance}>
                    ✅ Mark Attendance
                  </button>
                  {!isCapturing && (
                    <button className="btn btn-outline-primary" onClick={saveVectors}>
                      💾 Save Vectors
                    </button>
                  )}
                </div>
              </div>
            </div>
  
            {/* Блок розпізнаних облич */}
            <div className="col-12 col-lg-4">
              <div
                className="p-3 rounded bg-white"
                style={{
                  maxHeight: "75vh",
                  overflowY: "auto",
                  border: "1px solid #eee",
                }}
              >
                <h5 className="text-center mb-3" style={{ color: "#003366" }}>
                  🧑‍💻 Recognized Faces
                </h5>
  
                {loading && recognizedFaces.length === 0 ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" />
                  </div>
                ) : recognizedFaces.length > 0 ? (
                  <div className="d-flex flex-wrap gap-3 justify-content-center">
                    {recognizedFaces.map((face) => {
                      const isUnknown = face.name === "Unknown";
                      return (
                        <div
                          key={face.vectorId}
                          className="card border-0 shadow-sm"
                          style={{
                            width: "220px",
                            borderRadius: "12px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${face.faceImageBase64}`}
                            alt={face.name}
                            className="card-img-top"
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                          <div className="card-body text-center">
                            <strong style={{ color: "#333" }}>{face.name}</strong>
  
                            {isUnknown && !isCapturing && (
                              <select
                                className="form-select mt-2"
                                value={face.userId || ""}
                                onChange={(e) =>
                                  handleAssignStudent(face.vectorId, e.target.value)
                                }
                              >
                                <option value="">Select student...</option>
                                {studentsFromStore.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    {st.fullName}
                                  </option>
                                ))}
                              </select>
                            )}
  
                            <button
                              className="btn btn-outline-danger btn-sm mt-2 w-100"
                              onClick={() => handleRemoveFace(face.vectorId)}
                            >
                              🗑 Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted mt-3">
                    No faces recognized yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  
  
};

export default SessionPage;