import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import { detectBase64Video } from "../../services/api-facetrack-service";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { fetchSessionByIdAction } from "../../store/action-creators/sessionAction";
import { fetchStudentByGroupIdAction } from "../../store/action-creators/userActions";
import type { AppDispatch } from "../../store";
import { addedVectorsToStudents, deleteVector } from "../../services/api-faceVectors-service";
import { Modal, message } from "antd";
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
        const { success, message } = response as any; 
        if (success) {
            setRecognizedFaces((prev) => prev.filter((face) => face.vectorId !== vectorId));
        } else {
            console.error("Server error while deleting vector:", message);
            alert("Failed to delete vector. Try again.");
        }
    } catch (error) {
        console.error("Unexpected error deleting vector:", error);
        alert("Unexpected error occurred. Try again.");
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
        alert("Немає вибраних невідомих облич для збереження.");
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

      alert("Vectors saved successfully!");
    } catch (error) {
      console.error("Error saving vectors:", error);
      alert("Error saving vectors!");
    }
  };

  return (
    <div className="container py-3">
      <h2 className="text-center mb-4">Session {sessionId} - Face Recognition</h2>
  
      <div className="row">
        {/* Блок відео */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm p-3">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-100 rounded"
              style={{ maxHeight: "450px", objectFit: "cover" }}
            />
            <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
              <Button variant={isCapturing ? "danger" : "success"} onClick={toggleCapture}>
                {isCapturing ? "Stop Capturing" : "Start Capturing"}
              </Button>
              <Button variant="success" onClick={markAttendance}>Mark Attendance</Button>
              {!isCapturing && <Button variant="primary" onClick={saveVectors}>Save Vectors</Button>}
            </div>
          </div>
        </div>
  
        {/* Блок розпізнаних облич */}
        <div className="col-lg-4">
          <div className="card shadow-sm p-3">
            <h5 className="text-center">Recognized Faces</h5>
            {loading && recognizedFaces.length === 0 ? (
              <div className="text-center my-4">
                <div className="spinner-border text-primary" />
              </div>
            ) : recognizedFaces.length > 0 ? (
              <div className="d-flex flex-wrap gap-3">
                {recognizedFaces.map((face) => {
                  const isUnknown = face.name === "Unknown";
                  return (
                    <div
                      key={face.vectorId}
                      className="card p-2 shadow-sm"
                      style={{ width: "220px" }}
                    >
                      <img
                        src={`data:image/jpeg;base64,${face.faceImageBase64}`}
                        alt={face.name}
                        className="rounded mb-2"
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                      <div className="text-center fw-bold">{face.name}</div>

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

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="mt-2 w-100"
                        onClick={() => handleRemoveFace(face.vectorId)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>

            ) : (
              <p className="text-center text-muted mt-3">No faces recognized yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default SessionPage;