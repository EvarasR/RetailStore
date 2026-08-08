import React, { useEffect, useMemo, useRef } from 'react';
import { File, UploadCloud, X } from 'lucide-react';

interface FileDropzoneProps {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  helperText?: string;
  required?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ label, files, onChange, accept, multiple = false, helperText, required }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);
  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming);
    onChange(multiple ? [...files, ...next] : next.slice(0, 1));
  };

  return (
    <div className="admin-file-field">
      <label className="admin-field__label">{label}{required ? ' *' : ''}</label>
      <button type="button" className="admin-dropzone" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}>
        <UploadCloud size={28} />
        <strong>Arrastra archivos aquí</strong>
        <span>o selecciónalos desde tu equipo</span>
      </button>
      <input ref={inputRef} hidden type="file" accept={accept} multiple={multiple} onChange={(event) => addFiles(event.target.files)} />
      {helperText ? <small className="admin-field__helper">{helperText}</small> : null}
      {previews.length ? <div className="admin-file-previews">{previews.map(({ file, url }, index) => (
        <div key={`${file.name}-${file.lastModified}-${index}`} className="admin-file-preview">
          {file.type.startsWith('image/') ? <img src={url} alt={`Vista previa ${file.name}`} /> : file.type.startsWith('video/') ? <video src={url} muted preload="metadata" /> : <File size={28} />}
          <span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span>
          <button type="button" aria-label={`Quitar ${file.name}`} onClick={() => onChange(files.filter((_, current) => current !== index))}><X size={16} /></button>
        </div>
      ))}</div> : null}
    </div>
  );
};
