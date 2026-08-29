import { useRef, useState, useCallback } from 'react';
import { UploadCloud, Image, X, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { validateImage, optimizeRetinalImage } from '../../utils/imageOptimizer.js';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUploader({ onImageSelected, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState(null);

  const processFile = useCallback(
    async (file) => {
      if (!file) return;

      const val = validateImage(file);
      if (!val.valid) {
        setError(val.error);
        return;
      }

      setError(null);
      setOptimizing(true);

      try {
        const result = await optimizeRetinalImage(file);
        setPreview(result.optimizedUrl);
        setOptimizationStats({
          originalSizeKB: result.originalSizeKB,
          optimizedSizeKB: result.optimizedSizeKB,
          reductionPct: result.reductionPct,
        });

        // Pass optimized data URL to caller
        onImageSelected(result.optimizedUrl, file.name, result.thumbnailUrl);
      } catch (err) {
        setError('Failed to process and optimize image. Please try another file.');
      } finally {
        setOptimizing(false);
      }
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      processFile(file);
    },
    [processFile]
  );

  const handleClear = () => {
    setPreview(null);
    setError(null);
    setOptimizationStats(null);
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  if (preview) {
    return (
      <div className="upload-zone has-file animate-scale-up" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
        <img
          src={preview}
          alt="Selected fundus image for analysis"
          className="animate-fade-in"
          style={{ maxHeight: 240, borderRadius: 'var(--radius-lg)', objectFit: 'contain' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-success-dark)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
              Image ready for analysis
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleClear}
              aria-label="Remove selected image"
              style={{ cursor: 'pointer' }}
            >
              <X size={14} aria-hidden="true" /> Change
            </button>
          </div>

          {optimizationStats && optimizationStats.reductionPct > 0 && (
            <div
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                background: 'rgba(14, 116, 144, 0.18)',
                padding: '3px 10px',
                borderRadius: 12,
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={12} />
              Optimized for rural transmission: {optimizationStats.originalSizeKB}KB → {optimizationStats.optimizedSizeKB}KB ({optimizationStats.reductionPct}% saved)
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div
        className={`upload-zone${dragging ? ' dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload fundus image. Click or drag and drop a JPEG, PNG or WebP file."
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        style={{ cursor: 'pointer' }}
      >
        {dragging ? (
          <Image size={48} style={{ color: 'var(--color-primary)', opacity: 0.8 }} aria-hidden="true" />
        ) : (
          <UploadCloud size={48} className="upload-zone-icon" aria-hidden="true" />
        )}
        <div>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--text-base)', marginBottom: 4 }}>
            {optimizing ? 'Optimizing retinal image...' : dragging ? 'Release to upload' : 'Upload fundus image'}
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Drag and drop, or click to browse
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-subtle)', marginTop: 4 }}>
            JPEG, PNG, WebP · Max 15 MB · Automatic rural bandwidth compression
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={optimizing}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {optimizing ? 'Processing...' : 'Choose file'}
        </Button>
      </div>

      {error && (
        <p role="alert" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        aria-label="Upload fundus image file"
        style={{ display: 'none' }}
        onChange={(e) => processFile(e.target.files?.[0])}
      />
    </div>
  );
}
