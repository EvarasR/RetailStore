import React from 'react';
import { FileDropzone } from './FileDropzone';

interface ProductMediaUploaderProps {
  images: File[];
  videos: File[];
  pdf: File | null;
  onImagesChange: (files: File[]) => void;
  onVideosChange: (files: File[]) => void;
  onPdfChange: (file: File | null) => void;
}

export const ProductMediaUploader: React.FC<ProductMediaUploaderProps> = ({ images, videos, pdf, onImagesChange, onVideosChange, onPdfChange }) => (
  <div className="admin-media-uploader">
    <FileDropzone label="Imágenes del producto" files={images} onChange={onImagesChange} accept="image/jpeg,image/png,image/webp" multiple required helperText="JPG, PNG o WebP. Máximo 8 MB por imagen. La primera será principal." />
    <FileDropzone label="Videos" files={videos} onChange={onVideosChange} accept="video/mp4,video/webm" multiple helperText="MP4 o WebM. Máximo 60 MB por video; no se reproducen automáticamente." />
    <FileDropzone label="Ficha técnica PDF" files={pdf ? [pdf] : []} onChange={(files) => onPdfChange(files[0] || null)} accept="application/pdf" required helperText="PDF real, máximo 15 MB." />
  </div>
);
