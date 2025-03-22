import React, { useState } from "react";
import { Button, Card, Upload, Spin } from "antd";
import { UploadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { detectBase64 } from "../../services/face-recognition-service";
import "./FaceUpload.css"; // Додано кастомні стилі

const FaceUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  const handleMainImagePreview = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = () => setMainImagePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
  };

  const handleMainImageRemove = () => {
    setMainImagePreview(null);
    setFile(null);
  };

  const handleFileChange = (info: any) => {
    const currentFile = info.fileList[0]?.originFileObj;
    if (currentFile) {
      handleMainImagePreview(currentFile);
    } else {
      handleMainImageRemove();
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      console.error("Please select a file!");
      return;
    }

    setLoading(true);
    try {
      const response = await detectBase64(file);
      const { imageBase64 } = response as any;
      if (imageBase64) {
        setBase64Image(`data:image/png;base64,${imageBase64}`);
      } else {
        console.error("ImageBase64 not returned from server");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <Card className="upload-card">
        <h2 className="upload-title">Face Recognition</h2>
        <Upload
          maxCount={1}
          beforeUpload={() => false}
          showUploadList={false}
          onChange={handleFileChange}
        >
          <Button type="primary" size="large" className="upload-button">
            <UploadOutlined /> Upload Image
          </Button>
        </Upload>

        {mainImagePreview && (
          <div className="image-preview-container">
            <img
              src={mainImagePreview}
              alt="Main Preview"
              className="image-preview"
            />
            <Button
              onClick={handleMainImageRemove}
              type="text"
              icon={<CloseCircleOutlined style={{ color: "red", fontSize: "24px" }} />}
              className="remove-image-button"
            />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || !file}
          className="submit-button"
          type="primary"
          size="large"
        >
          {loading ? <Spin /> : "Submit"}
        </Button>
      </Card>

      {base64Image && (
        <div className="processed-image-container">
          <Card className="processed-card">
            <h3 className="processed-title">Processed Image:</h3>
            <img src={base64Image} alt="Processed" className="processed-image" />
          </Card>
        </div>
      )}
    </div>
  );
};

export default FaceUpload;
