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
      imageFiles: device?.details?.images || [],
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

      setUpdatedDevice(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [key]: parsedValue,
        },
      }));
    } else {
      setUpdatedDevice(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setPreviewURLs(files.map(file => URL.createObjectURL(file)));
  };

  const isEditing = !!device;
  const endpoint = isEditing
    ? `${BASE_URL}/inventory/devices/update/${device._id || device.deviceId}`
    : `${BASE_URL}/inventory/devices/add`;
  const method = isEditing ? "PUT" : "POST";

  const handleSubmit = async () => {
    try {
      let uploadedImageUrls = [];

      if (imageFiles.length > 0) {
        const form = new FormData();
        imageFiles.forEach(file => form.append('images', file));

        const uploadRes = await fetch(`${BASE_URL}/upload`, {
          method: 'POST',
          body: form,
          credentials: 'include',
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData?.error || 'Cloudinary image upload failed.');
        }

        const result = await uploadRes.json();
        uploadedImageUrls = result.images || [];
      }

      const finalData = {
        ...updatedDevice,
        details: {
          ...updatedDevice.details,
          images: [
            ...(updatedDevice.details?.images || []),
            ...uploadedImageUrls,
          ],
        },
      };

      const formData = new FormData();
      for (const [key, value] of Object.entries(finalData)) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }

      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error: ${res.status}`);
      }

      const data = await res.json();
      toast.success("Device saved successfully!");
      onSave(data.device);
      onClose();

    } catch (err) {
      console.error("Save error:", err);
      toast.error(`Save failed: ${err.message}`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{isEditing ? "Edit Device" : "Add Device"}</h2>

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
            value={updatedDevice.details.CAMResolution.join(', ')}
            onChange={e => setUpdatedDevice(prev => ({
              ...prev,
              details: {
                ...prev.details,
                CAMResolution: e.target.value.split(',').map(s => s.trim()),
              }
            }))}
          />

          <label>Colors (comma separated):</label>
          <input className="modal-input-text"
            value={updatedDevice.details.colors.join(', ')}
            onChange={e => setUpdatedDevice(prev => ({
              ...prev,
              details: {
                ...prev.details,
                colors: e.target.value.split(',').map(s => s.trim()),
              }
            }))}
          />

          <label>Battery Life (Hours):</label>
          <input className="modal-input-number"
            type="number"
            value={updatedDevice.details.batteryLife.hours}
            onChange={e => setUpdatedDevice(prev => ({
              ...prev,
              details: {
                ...prev.details,
                batteryLife: {
                  ...prev.details.batteryLife,
                  hours: Number(e.target.value),
                },
              },
            }))}
          />

          <label>Battery Life (%):</label>
          <input className="modal-input-number"
            type="number"
            value={updatedDevice.details.batteryLife.percentage}
            onChange={e => setUpdatedDevice(prev => ({
              ...prev,
              details: {
                ...prev.details,
                batteryLife: {
                  ...prev.details.batteryLife,
                  percentage: Number(e.target.value),
                },
              },
            }))}
          />

          <label>Upload Images:</label>
          <input className="modal-input-file" type="file" accept="image/*" multiple onChange={handleImageChange} />

          {previewURLs.length > 0 && (
            <div className="image-preview">
              {previewURLs.map((src, i) => (
                <img key={i} src={src} alt={`Preview ${i + 1}`} className="preview-thumb" />
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
