import React, { useState } from "react";
import { Form, Button, Upload } from 'antd';
import { UploadOutlined, CloseCircleOutlined } from '@ant-design/icons';

// Імпорт функції detectBase64 з сервісу
import { detectBase64 } from "../services/face-recognition-service";

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

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
      // Використовуємо сервіс detectBase64
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
    <div className="container mt-4">
      <h2 className="mb-4">Face Recognition App</h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="MainImageFile"
          label="Головне зображення"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[
            { required: true, message: 'Будь ласка, завантажте головне зображення!' },
            {
              validator: (_, fileList) => {
                if (!fileList || fileList.length === 0) {
                  return Promise.reject('Будь ласка, завантажте файл!');
                }
                const fileToCheck = fileList[0].originFileObj || fileList[0];
                if (!/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileToCheck.name)) {
                  return Promise.reject('Невірний формат файлу!');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Upload
            maxCount={1}
            beforeUpload={() => false}
            showUploadList={false}
            onChange={handleFileChange}
          >
            <Button icon={<UploadOutlined />}>Завантажити головне зображення</Button>
          </Upload>
        </Form.Item>

        {/* Прев'ю та кнопка видалення поза Form.Item */}
        {mainImagePreview && (
          <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
            <img
              src={mainImagePreview}
              alt="Main Preview"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover'
              }}
            />
            <Button
              onClick={handleMainImageRemove}
              type="text"
              icon={<CloseCircleOutlined />}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                color: 'red',
                fontSize: '20px',
                background: 'transparent',
              }}
            />
          </div>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Надіслати</Button>
        </Form.Item>
      </Form>

      {base64Image && (
        <div className="mt-4">
          <h3>Оброблене зображення:</h3>
          <img src={base64Image} alt="Processed face" className="img-fluid" />
        </div>
      )}
    </div>
  );
};

export default FaceUpload;
