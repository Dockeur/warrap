// src/components/observations/ObservationViewer.tsx
// VIEWER GRATUIT (pas PDFTron)
// Affiche les fichiers avec les rectangles d'annotations

import React, { useRef, useEffect, useState } from 'react';
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Observation, ObservationViewerProps } from '../../types';



const ObservationViewer: React.FC<ObservationViewerProps> = ({
  fileUrl,
  fileName,
  fileType,
  observations,
  currentPage = 1,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    img.onload = () => setImage(img);
    img.onerror = () => toast.error('Erreur de chargement');
    img.src = fileUrl;
  }, [fileUrl]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2 + pan.x, -canvas.height / 2 + pan.y);

    // Image
    ctx.drawImage(image, 0, 0);

    // Rectangles d'observations
    observations.forEach((obs, index) => {
      if (!obs.coordinates) return;
      
      // Filtrer par page pour PDF
      if (fileType === 'pdf' && obs.coordinates.page !== currentPage) return;

      const isSelected = selectedObs?.id === obs.id;
      const color = getCriticalColor(obs.critical);
      
      // Rectangle
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(
        obs.coordinates.x,
        obs.coordinates.y,
        obs.coordinates.width,
        obs.coordinates.height
      );
      
      // Fond semi-transparent
      ctx.fillStyle = `${color}22`;
      ctx.fillRect(
        obs.coordinates.x,
        obs.coordinates.y,
        obs.coordinates.width,
        obs.coordinates.height
      );

      // Numéro
      const numX = obs.coordinates.x;
      const numY = obs.coordinates.y - 10;
      
      ctx.beginPath();
      ctx.arc(numX + 15, numY, 15, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), numX + 15, numY);
    });

    ctx.restore();
  };

  useEffect(() => {
    drawCanvas();
  }, [image, observations, zoom, rotation, pan, selectedObs, currentPage]);

  const getCriticalColor = (critical: string) => {
    switch (critical) {
      case 'warning': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'accepted': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCriticalLabel = (critical: string) => {
    switch (critical) {
      case 'warning': return ' Avertissement';
      case 'rejected': return ' Rejeté';
      case 'accepted': return ' Accepté';
      default: return critical;
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    const clicked = observations.find((obs) => {
      if (!obs.coordinates) return false;
      const c = obs.coordinates;
      return x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height;
    });

    setSelectedObs(clicked || null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `annotated_${fileName}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Image téléchargée');
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-xl font-bold">{fileName}</h2>
          <p className="text-sm text-gray-400">
            {observations.length} observation(s)
            {fileType === 'pdf' && ` | Page ${currentPage}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-gray-700 rounded">
            <FiZoomOut />
          </button>
          <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 hover:bg-gray-700 rounded">
            <FiZoomIn />
          </button>
          <button onClick={() => setRotation((rotation + 90) % 360)} className="p-2 hover:bg-gray-700 rounded">
            <FiRotateCw />
          </button>
          <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2">
            <FiDownload />
            Télécharger
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded">
            <FiX className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 pt-20">
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-w-full max-h-full cursor-pointer"
            style={{ boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-gray-800 text-white overflow-y-auto p-4">
          <h3 className="text-lg font-bold mb-4"> Observations ({observations.length})</h3>
          
          <div className="space-y-3">
            {observations.map((obs, index) => {
              const isSelected = selectedObs?.id === obs.id;
              const color = getCriticalColor(obs.critical);
              
              return (
                <div
                  key={obs.id}
                  onClick={() => setSelectedObs(obs)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{obs.name}</h4>
                      <p className="text-xs mt-1 px-2 py-1 rounded inline-block" style={{ backgroundColor: `${color}33`, color }}>
                        {getCriticalLabel(obs.critical)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-300 mt-2 line-clamp-3">{obs.description}</p>
                  
                  {obs.coordinates && (
                    <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono">
                      <div> ({Math.round(obs.coordinates.x)}, {Math.round(obs.coordinates.y)})</div>
                      <div> {Math.round(obs.coordinates.width)} × {Math.round(obs.coordinates.height)}px</div>
                      {obs.coordinates.page && <div>📄 Page {obs.coordinates.page}</div>}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(obs.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationViewer;