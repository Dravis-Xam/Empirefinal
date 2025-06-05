import React, { useState } from "react";
import './modal.css';
import { toast } from "../../../modules/Store/ToastStore";

const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DeviceModal = ({ device, onClose, onSave }) => {
  const [updatedDevice, setUpdatedDevice] = useState({
    deviceId: device?.deviceId || generateUniqueId(),
    brand: device?.brand || "",
    model: device?.model || "",
    build: device?.build || "",
    price: device?.price || 0,
    amountInStock: device?.amountInStock || 0,
    featured: device?.featured || false,
    details: {
      RAM: device?.details?.RAM || 0,
      storage: device?.details?.storage || 0,
      os: device?.details?.os || "",
      processorType: device?.details?.processorType || "",
      colors: device?.details?.colors || [],
      CAMResolution: device?.details?.CAMResolution || [],
      batteryLife: {
        hours: device?.details?.batteryLife?.hours || 0,
        percentage: device?.details?.batteryLife?.percentage || 0,
      },
    },
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("details.")) {
      const key = name.split(".")[1];
      const parsedValue = type === "number" ? Number(value) : value;

      setUpdatedDevice((prev) => ({
        ...prev,
        details: {
          ...(prev.details || {}),
          [key]: parsedValue,
        },
      }));
    } else {
      setUpdatedDevice((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewURLs(urls);
  };

  const isEditing = !!device;
  const endpoint = isEditing
    ? `${BASE_URL}/inventory/devices/update/${updatedDevice._id || updatedDevice.deviceId}`
    : `${BASE_URL}/inventory/devices/add`;

  const method = isEditing ? "PUT" : "POST";

  const handleSubmit = async () => {
    try {
      let uploadedImageUrls = [];

      if (imageFiles.length > 0) {
        try {
          const uploadFormData = new FormData();
          imageFiles.forEach(file => uploadFormData.append('images', file));
          
          const uploadResponse = await fetch(`${BASE_URL}/uploads`, {
            method: 'POST',
            credentials: 'include',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Image upload failed (server error)');
          }

          const uploadResult = await uploadResponse.json();

          // Expecting returned format: { images: ['https://...img1', 'https://...img2'] }
          uploadedImageUrls = uploadResult.images || [];
        } catch (uploadError) {
          toast.error("Image upload failed:", uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
      }

      const finalDeviceData = {
        ...updatedDevice,
        details: {
          ...updatedDevice.details,
          images: [
            ...(updatedDevice.details?.images?.filter(img => typeof img === 'string') || []),
            ...uploadedImageUrls.filter(url => typeof url === 'string')
          ].filter(Boolean),
        },
      };

      const formData = new FormData();
      Object.entries(finalDeviceData).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : value
        );
      });

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const savedDevice = await response.json();
      onSave(savedDevice.device);
      onClose();

    } catch (err) {
      console.error("Submission error:", err);
      toast.error(`Operation failed: ${err.message}`);
    }
  };


  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Update Device</h2>
        <div className="grid">
          <label>Brand:</label>
          <input className="modal-input-text" name="brand" value={updatedDevice.brand} onChange={handleChange} />

          <label>Model:</label>
          <input className="modal-input-text" name="model" value={updatedDevice.model} onChange={handleChange} />

          <label>Build:</label>
          <input className="modal-input-text" name="build" value={updatedDevice.build} onChange={handleChange} />

          <label>Price (Ksh):</label>
          <input className="modal-input-number" name="price" type="number" value={updatedDevice.price} onChange={handleChange} />

          <label>In Stock:</label>
          <input className="modal-input-number" name="amountInStock" type="number" value={updatedDevice.amountInStock} onChange={handleChange} />

          <label>Featured:</label>
          <input className="modal-input-radio" name="featured" type="checkbox" checked={updatedDevice.featured} onChange={handleChange} />

          <label>Storage (GB):</label>
          <input className="modal-input-text" name="details.storage" type="number" value={updatedDevice.details.storage} onChange={handleChange} />

          <label>RAM (GB):</label>
          <input className="modal-input-text" name="details.RAM" type="number" value={updatedDevice.details.RAM} onChange={handleChange} />

          <label>OS:</label>
          <input className="modal-input-text" name="details.os" value={updatedDevice.details.os} onChange={handleChange} />

          <label>Processor:</label>
          <input className="modal-input-text" name="details.processorType" value={updatedDevice.details.processorType} onChange={handleChange} />

          <label>Camera (comma separated):</label>
          <input className="modal-input-text"
            name="details.CAMResolution"
            value={updatedDevice.details.CAMResolution.join(", ")}
            onChange={(e) => {
              const CAMResolution = e.target.value.split(",").map((s) => s.trim());
              setUpdatedDevice((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  CAMResolution,
                },
              }));
            }}
          />
          
          <label>Colors (comma separated):</label>
          <input className="modal-input-text"
            name="details.colors"
            value={updatedDevice.details.colors.join(", ")}
            onChange={(e) => {
              const colors = e.target.value.split(",").map((s) => s.trim());
              setUpdatedDevice((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  colors,
                },
              }));
            }}
          />

          <label>Battery Life (Hours):</label>
          <input className="modal-input-number"
            type="number"
            value={updatedDevice.details.batteryLife.hours}
            onChange={(e) => {
              const hours = Number(e.target.value);
              setUpdatedDevice((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  batteryLife: {
                    ...prev.details.batteryLife,
                    hours,
                  },
                },
              }));
            }}
          />

          <label>Battery Life (%):</label>
          <input className="modal-input-number"
            type="number"
            value={updatedDevice.details.batteryLife.percentage}
            onChange={(e) => {
              const percentage = Number(e.target.value);
              setUpdatedDevice((prev) => ({
                ...prev,
                details: {
                  ...prev.details,
                  batteryLife: {
                    ...prev.details.batteryLife,
                    percentage,
                  },
                },
              }));
            }}
          />

          <label>Upload Images:</label>
          <input className="modal-input-file" type="file" multiple accept="image/*" onChange={handleImageChange} />

          {previewURLs.length > 0 && (
            <div className="image-preview">
              {previewURLs.map((url, idx) => (
                <img key={idx} src={url} alt={`Preview ${idx + 1}`} className="preview-thumb" />
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions light">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;