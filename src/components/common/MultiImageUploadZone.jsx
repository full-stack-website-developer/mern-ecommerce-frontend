import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

/**
 * Reusable multiple image upload component with drag & drop support
 * @param {Object} props
 * @param {Array} props.images - Array of current images
 * @param {Function} props.onImagesChange - Callback when images change
 * @param {Function} props.onImageRemove - Callback when an image is removed
 * @param {number} props.maxImages - Maximum number of images allowed
 * @param {string} props.label - Label text for the upload area
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.gridCols - Number of columns in preview grid
 */
const MultiImageUploadZone = ({
  images = [],
  onImagesChange,
  onImageRemove,
  maxImages = 20,
  label = 'Upload Images',
  placeholder = 'Drop multiple images here',
  className = '',
  gridCols = 3,
  icon: Icon = ImageIcon,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  // Handle file selection
  const handleFilesChange = (files) => {
    if (!files) return;

    const fileArray = Array.from(files);

    // Only allow images
    const validImages = fileArray.filter(file => file.type.startsWith('image/'));

    // Limit to max images
    const remainingSlots = maxImages - images.length;
    const imagesToAdd = validImages.slice(0, remainingSlots);

    // Map files to objects with File + preview
    const newImages = imagesToAdd.map(file => ({
        file,                          // File object to send to backend
        preview: URL.createObjectURL(file), // Preview for UI only
    }));

    // Update state / parent callback
    const updatedImages = [...images, ...newImages];
    onImagesChange?.(updatedImages);
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
    if (e.dataTransfer.files) {
      handleFilesChange(e.dataTransfer.files);
    }
  };

  // Handle remove single image
  const handleRemove = (index, url='') => {
    onImageRemove?.(index, url);
  };

  const isMaxReached = images.length >= maxImages;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          <span className="text-xs text-gray-500 ml-2">
            ({images.length}/{maxImages})
          </span>
        </label>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${isMaxReached ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isMaxReached && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFilesChange(e.target.files)}
          className="hidden"
          disabled={isMaxReached}
        />
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {placeholder}, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum {maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Images Preview Grid */}
      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto py-2 mt-4 scroll-snap-x-mandatory scroll-smooth">
          {images.map((image, index) => (
            <div key={index} className="relative flex-shrink-0 w-24 sm:w-32 md:w-40 group scroll-snap-align-start">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={image?.url || image.preview}
                  alt={image.name || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => handleRemove(index, image.url)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5"
                    aria-label={`Remove image ${index + 1}`}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 truncate">
                {image.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUploadZone;