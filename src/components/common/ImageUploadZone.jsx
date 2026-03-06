import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

/**
 * Reusable image upload component with drag & drop support
 * @param {Object} props
 * @param {File|null} props.image - Current image data
 * @param {Function} props.onImageChange - Callback when image changes
 * @param {Function} props.onImageRemove - Callback when image is removed
 * @param {string} props.label - Label text for the upload area
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.showPreview - Whether to show image preview
 * @param {string} props.className - Additional CSS classes
 */
const ImageUploadZone = ({
  image = null,
  onImageChange,
  onImageRemove,
  label = 'Upload Image',
  placeholder = 'Drop your image here, or browse',
  defaultText = 'Default: no-image.jpg',
  showPreview = true,
  className = '',
  icon: Icon = Upload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (files) => {
    if (!files || !files[0]) return;

    const file = files[0];

    // Only allow images
    if (!file.type.startsWith('image/')) return;

    // Generate preview for UI only
    const preview = URL.createObjectURL(file);

    const imageData = {
      file,     // File object to send to backend
      preview,  // preview in UI
    };

    onImageChange?.(imageData);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  // Handle remove
  const handleRemove = () => {
    onImageRemove?.();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {image && showPreview ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={image?.url || image.preview}
              alt={image.name || 'Preview'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                aria-label="Remove image"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {placeholder.split(',')[0]}
                {placeholder.includes(',') && (
                  <>
                    , or <span className="text-blue-600">browse</span>
                  </>
                )}
              </p>
              {defaultText && (
                <p className="text-xs text-gray-500 mt-1">{defaultText}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;