import { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RotateCw, Check, X, ScanLine, Crop as CropIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const ImageEditor = ({ imageSrc, onSave, onCancel, isOpen }: ImageEditorProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);
  const [mode, setMode] = useState<"crop" | "perspective">("perspective");
  const [corners, setCorners] = useState<Point[]>([]);
  const [draggingCorner, setDraggingCorner] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const perspectiveCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imgRef.current && mode === "perspective") {
      const img = imgRef.current;
      const width = img.offsetWidth;
      const height = img.offsetHeight;
      
      // Initialize corners at image edges with some margin
      const margin = 20;
      setCorners([
        { x: margin, y: margin }, // top-left
        { x: width - margin, y: margin }, // top-right
        { x: width - margin, y: height - margin }, // bottom-right
        { x: margin, y: height - margin }, // bottom-left
      ]);
    }
  }, [imageSrc, mode]);

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingCorner(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingCorner === null || !imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const newCorners = [...corners];
    newCorners[draggingCorner] = { x, y };
    setCorners(newCorners);
  };

  const handleMouseUp = () => {
    setDraggingCorner(null);
  };

  const applyPerspectiveTransform = () => {
    if (!imgRef.current || corners.length !== 4) return null;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Calculate the dimensions of the output
    const width = Math.max(
      Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y),
      Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y)
    );
    const height = Math.max(
      Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y),
      Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y)
    );

    canvas.width = width;
    canvas.height = height;

    // Scale corners to natural image size
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;
    
    const scaledCorners = corners.map(c => ({
      x: c.x * scaleX,
      y: c.y * scaleY
    }));

    // Simple perspective transform using destination corners
    const destCorners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];

    // Draw using transform - simplified approach
    // For better results, we'd need a full perspective transform library
    // This is a basic implementation
    ctx.drawImage(
      img,
      scaledCorners[0].x,
      scaledCorners[0].y,
      scaledCorners[1].x - scaledCorners[0].x,
      scaledCorners[3].y - scaledCorners[0].y,
      0,
      0,
      width,
      height
    );

    return canvas;
  };

  const handleSave = async () => {
    if (!imgRef.current) return;

    let finalCanvas: HTMLCanvasElement;

    if (mode === "perspective" && corners.length === 4) {
      const perspectiveCanvas = applyPerspectiveTransform();
      if (!perspectiveCanvas) return;
      finalCanvas = perspectiveCanvas;
    } else {
      // Regular crop mode
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const rotRad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rotRad));
      const cos = Math.abs(Math.cos(rotRad));

      const cropWidth = crop ? crop.width * scaleX : image.naturalWidth;
      const cropHeight = crop ? crop.height * scaleY : image.naturalHeight;

      canvas.width = cropWidth * cos + cropHeight * sin;
      canvas.height = cropWidth * sin + cropHeight * cos;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotRad);

      const sourceX = crop ? crop.x * scaleX : 0;
      const sourceY = crop ? crop.y * scaleY : 0;

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        -cropWidth / 2,
        -cropHeight / 2,
        cropWidth,
        cropHeight
      );

      finalCanvas = canvas;
    }

    finalCanvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, "image/jpeg", 0.9);
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center">עריכת תמונה</DialogTitle>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(v) => setMode(v as "crop" | "perspective")} dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="perspective" className="gap-2">
              <ScanLine className="w-4 h-4" />
              יישור וסריקה
            </TabsTrigger>
            <TabsTrigger value="crop" className="gap-2">
              <CropIcon className="w-4 h-4" />
              חיתוך רגיל
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perspective" className="space-y-4">
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={rotate}
                className="gap-2"
              >
                <RotateCw className="w-4 h-4" />
                סיבוב
              </Button>
            </div>

            <div 
              className="flex justify-center relative" 
              dir="ltr"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="relative inline-block">
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="עריכה"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    maxHeight: "60vh",
                    maxWidth: "100%",
                    userSelect: "none",
                  }}
                  draggable={false}
                />
                
                {/* Draw perspective lines */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: "100%", height: "100%" }}
                >
                  {corners.length === 4 && (
                    <>
                      <polygon
                        points={corners.map(c => `${c.x},${c.y}`).join(" ")}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <line x1={corners[0].x} y1={corners[0].y} x2={corners[1].x} y2={corners[1].y} stroke="#3b82f6" strokeWidth="2" />
                      <line x1={corners[1].x} y1={corners[1].y} x2={corners[2].x} y2={corners[2].y} stroke="#3b82f6" strokeWidth="2" />
                      <line x1={corners[2].x} y1={corners[2].y} x2={corners[3].x} y2={corners[3].y} stroke="#3b82f6" strokeWidth="2" />
                      <line x1={corners[3].x} y1={corners[3].y} x2={corners[0].x} y2={corners[0].y} stroke="#3b82f6" strokeWidth="2" />
                    </>
                  )}
                </svg>

                {/* Corner handles */}
                {corners.map((corner, index) => (
                  <div
                    key={index}
                    className="absolute w-6 h-6 bg-primary border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    style={{
                      left: `${corner.x}px`,
                      top: `${corner.y}px`,
                    }}
                    onMouseDown={handleMouseDown(index)}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              גררו את הנקודות לפינות הבגד ליישור מושלם
            </p>
          </TabsContent>

          <TabsContent value="crop" className="space-y-4">
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={rotate}
                className="gap-2"
              >
                <RotateCw className="w-4 h-4" />
                סיבוב
              </Button>
            </div>

            <div className="flex justify-center" dir="ltr">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={undefined}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="עריכה"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    maxHeight: "60vh",
                    maxWidth: "100%",
                  }}
                />
              </ReactCrop>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              גררו את המסגרת כדי לחתוך את התמונה
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2" dir="rtl">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            ביטול
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            שמירה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
