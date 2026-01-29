import { useState } from 'react';

const ProductImageGallery = ({ images = [] }) => {
  const placeholderImages = [
    'https://via.placeholder.com/600x600?text=Main+Image',
    'https://via.placeholder.com/600x600?text=Image+2',
    'https://via.placeholder.com/600x600?text=Image+3',
    'https://via.placeholder.com/600x600?text=Image+4',
  ];

  const displayImages = images.length > 0 ? images : placeholderImages;
  const [selectedImage, setSelectedImage] = useState(displayImages[0]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={selectedImage}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Images */}
      <div className="grid grid-cols-4 gap-4">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
              selectedImage === image ? 'border-primary-600' : 'border-transparent'
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
