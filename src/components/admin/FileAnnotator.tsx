// src/components/admin/FileAnnotator.tsx


import React, { useRef, useEffect, useState } from 'react';
import { 
  FiX, FiZoomIn, FiZoomOut, FiTrash2, FiSquare,
  FiMove, FiCheck, FiDownload, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import * as pdfjsLib from 'pdfjs-dist';
import { AnnotationBox, BackendCoordinates, BackendObservation, FileAnnotatorProps } from '../../types';

// Configuration PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


type Tool = 'select' | 'draw';

const FileAnnotator: React.FC<FileAnnotatorProps> = ({
  fileUrl,
  fileName,
  fileType,
  fileId,
  isProjectFile,
  onSave,
  onClose,
  currentPage: initialPage = 1,
  existingAnnotations = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [tool, setTool] = useState<Tool>('draw');
  const [annotations, setAnnotations] = useState<AnnotationBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<AnnotationBox | null>(null);
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Chargement...');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [observationData, setObservationData] = useState({
    name: '',
    description: '',
    critical: 'warning' as 'warning' | 'rejected' | 'accepted',
  });

  // États PDF
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    loadFile();
  }, [fileUrl, fileType, currentPage]);

  const loadFile = async () => {
    setImageLoaded(false);
    setImageError(false);

    try {
      if (fileType === 'pdf') {
        await loadPDF();
      } else if (fileType === 'image') {
        await loadImage();
      } else {
        setImageError(true);
        setLoadingMessage(`Les fichiers ${fileType.toUpperCase()} doivent être convertis en PDF ou image côté serveur.`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setImageError(true);
      setLoadingMessage('Erreur de chargement');
    }
  };


  const loadImage = async () => {
    setLoadingMessage('Chargement de l\'image...');
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
        initializeCanvas(img);
        loadExistingAnnotations();
        resolve();
      };

      img.onerror = () => {     
        const img2 = new Image();
        img2.onload = () => {
          imageRef.current = img2;
          setImageLoaded(true);
          initializeCanvas(img2);
          loadExistingAnnotations();
          resolve();
        };

        img2.onerror = () => {
          console.error('❌ Impossible de charger l\'image');
          reject(new Error('Chargement image échoué'));
        };

        img2.src = fileUrl;
      };

      img.src = fileUrl;
    });
  };



  const loadPDF = async () => {
    setLoadingMessage(`Chargement du PDF (page ${currentPage})...`);
    try {
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
    
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);

      const page = await pdf.getPage(currentPage);

      const viewport = page.getViewport({ scale: 2 });

      const tempCanvas = document.createElement('canvas');
      const context = tempCanvas.getContext('2d');
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
        initializeCanvas(img);
        loadExistingAnnotations();
      };
      img.src = tempCanvas.toDataURL();

    } catch (error: any) {
      console.error('❌ Erreur PDF:', error);
      toast.error('Impossible de charger le PDF');
      setImageError(true);
      setLoadingMessage(`Erreur: ${error.message}`);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  const initializeCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxWidth = 1200;
    const maxHeight = 800;
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    drawCanvas();
  };


  const loadExistingAnnotations = () => {
    if (!existingAnnotations.length) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const scale = canvas.width / img.width;

    const boxes: AnnotationBox[] = existingAnnotations
      .filter(obs => obs.coordinates && (!obs.coordinates.page || obs.coordinates.page === currentPage))
      .map((obs, index) => ({
        id: `existing-${index}`,
        x: obs.coordinates.x * scale,
        y: obs.coordinates.y * scale,
        width: obs.coordinates.width * scale,
        height: obs.coordinates.height * scale,
        color: obs.coordinates.strokeColor || getCriticalColor(obs.critical),
        label: obs.name,
      }));

    setAnnotations(boxes);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    annotations.forEach((box) => drawBox(ctx, box));
    if (currentBox) drawBox(ctx, currentBox, true);
  };

  const drawBox = (ctx: CanvasRenderingContext2D, box: AnnotationBox, isCurrent = false) => {
    ctx.strokeStyle = box.color;
    ctx.lineWidth = isCurrent ? 3 : 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    ctx.fillStyle = `${box.color}22`;
    ctx.fillRect(box.x, box.y, box.width, box.height);

    if (box.label) {
      ctx.fillStyle = box.color;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(box.label, box.x + 5, box.y + 20);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [annotations, currentBox, zoom]);

  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({
      id: `temp-${Date.now()}`,
      x, y, width: 0, height: 0,
      color: selectedColor,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const width = x - startPos.x;
    const height = y - startPos.y;

    setCurrentBox({
      id: currentBox?.id || `temp-${Date.now()}`,
      x: width < 0 ? x : startPos.x,
      y: height < 0 ? y : startPos.y,
      width: Math.abs(width),
      height: Math.abs(height),
      color: selectedColor,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentBox && currentBox.width > 10 && currentBox.height > 10) {
      setAnnotations([...annotations, currentBox]);
      setShowSaveDialog(true);
    } else {
      toast.error('Zone trop petite');
    }
    setCurrentBox(null);
  };

  const handleSave = () => {
    if (annotations.length === 0) {
      toast.error('Aucune annotation');
      return;
    }

    if (!observationData.name.trim() || !observationData.description.trim()) {
      toast.error('Veuillez remplir le nom et la description');
      return;
    }

    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const scale = canvas.width / img.width;
    const lastBox = annotations[annotations.length - 1];

    const coordinates: BackendCoordinates = {
      x: Math.round(lastBox.x / scale),
      y: Math.round(lastBox.y / scale),
      width: Math.round(lastBox.width / scale),
      height: Math.round(lastBox.height / scale),
      strokeColor: lastBox.color,
    };

    if (fileType === 'pdf') {
      coordinates.page = currentPage;
    }

    const observation: BackendObservation = {
      name: observationData.name,
      description: observationData.description,
      critical: observationData.critical,
      document_type: fileType,
      coordinates,
    };

    if (isProjectFile) {
      observation.project_file_id = fileId;
    } else {
      observation.project_image_id = fileId;
    }

    console.log('💾 Sauvegarde:', observation);
    onSave(observation);

    setShowSaveDialog(false);
    setObservationData({ name: '', description: '', critical: 'warning' });
  };

  const handleClear = () => {
    setAnnotations([]);
    setCurrentBox(null);
  };

  const handleZoom = (delta: number) => {
    setZoom(Math.max(0.5, Math.min(3, zoom + delta)));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `annotated_${fileName}_page${currentPage}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Image téléchargée');
    });
  };

  const getCriticalColor = (critical: string) => {
    switch (critical) {
      case 'warning': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'accepted': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between shadow-lg">
        <div>
          <h2 className="text-xl font-bold">{fileName}</h2>
          <p className="text-sm text-gray-400">
            {fileType.toUpperCase()}
            {fileType === 'pdf' && ` | Page ${currentPage} / ${totalPages}`}
            {existingAnnotations.length > 0 && ` | ${existingAnnotations.length} annotation(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fileType === 'pdf' && totalPages > 1 && (
            <>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || !imageLoaded}
                className="p-2 hover:bg-gray-700 rounded transition disabled:opacity-50"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm px-3 py-1 bg-gray-700 rounded">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || !imageLoaded}
                className="p-2 hover:bg-gray-700 rounded transition disabled:opacity-50"
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
              <div className="w-px h-8 bg-gray-600 mx-2"></div>
            </>
          )}

          <button onClick={() => handleZoom(-0.1)} disabled={!imageLoaded} className="p-2 hover:bg-gray-700 rounded transition disabled:opacity-50">
            <FiZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => handleZoom(0.1)} disabled={!imageLoaded} className="p-2 hover:bg-gray-700 rounded transition disabled:opacity-50">
            <FiZoomIn className="h-5 w-5" />
          </button>
          <button onClick={handleDownload} disabled={!imageLoaded} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition disabled:opacity-50">
            <FiDownload className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded transition">
            <FiX className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-700 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => setTool('select')} disabled={!imageLoaded} className={`p-3 rounded transition ${tool === 'select' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'} disabled:opacity-50`}>
            <FiMove className="h-5 w-5" />
          </button>
          <button onClick={() => setTool('draw')} disabled={!imageLoaded} className={`p-3 rounded transition ${tool === 'draw' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'} disabled:opacity-50`}>
            <FiSquare className="h-5 w-5" />
          </button>

          <div className="h-8 w-px bg-gray-500 mx-2"></div>

          <span className="text-sm text-gray-300">Couleur:</span>
          {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'].map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              disabled={!imageLoaded}
              className={`w-8 h-8 rounded border-2 transition disabled:opacity-50 ${selectedColor === color ? 'border-white scale-110' : 'border-gray-600'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <button onClick={handleClear} disabled={!imageLoaded || annotations.length === 0} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50 flex items-center gap-2">
          <FiTrash2 />
          Effacer ({annotations.length})
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4">
        {!imageLoaded && !imageError && (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">{loadingMessage}</p>
          </div>
        )}

        {imageError && (
          <div className="text-white text-center max-w-2xl">
            <p className="text-lg text-red-400 mb-4">❌ {loadingMessage}</p>
            <p className="text-sm text-gray-400 mb-4">URL: {fileUrl}</p>
            <button onClick={loadFile} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition">
              Réessayer
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `scale(${zoom})`,
            cursor: tool === 'draw' ? 'crosshair' : 'move',
            display: imageLoaded ? 'block' : 'none',
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
          }}
          className="transition-transform"
        />
      </div>

      {/* Dialog Sauvegarde */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900"> Enregistrer l'annotation</h3>
              <button onClick={() => setShowSaveDialog(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={observationData.name}
                  onChange={(e) => setObservationData({ ...observationData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Fissure mur"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={observationData.description}
                  onChange={(e) => setObservationData({ ...observationData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Détails..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Criticité *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'warning', label: ' Avertissement', color: 'orange' },
                    { value: 'accepted', label: ' Accepté', color: 'green' },
                    { value: 'rejected', label: ' Rejeté', color: 'red' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setObservationData({ ...observationData, critical: option.value as any })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                        observationData.critical === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSaveDialog(false)} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={handleSave} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <FiCheck className="h-5 w-5" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAnnotator;