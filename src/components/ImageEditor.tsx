import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RotateCw, Check, X } from "lucide-react";

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ImageEditor = ({ imageSrc, onSave, onCancel, isOpen }: ImageEditorProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSave = async () => {
    if (!imgRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate dimensions for rotation
    const rotRad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rotRad));
    const cos = Math.abs(Math.cos(rotRad));

    const cropWidth = crop ? crop.width * scaleX : image.naturalWidth;
    const cropHeight = crop ? crop.height * scaleY : image.naturalHeight;

    // Set canvas size based on rotation
    canvas.width = cropWidth * cos + cropHeight * sin;
    canvas.height = cropWidth * sin + cropHeight * cos;

    // Move to center and rotate
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotRad);

    // Draw the image
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

    canvas.toBlob((blob) => {
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
          <DialogTitle className="text-center">עריכת תמונה ✂️</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
            גררו את המסגרת כדי לחתוך את התמונה 📐
          </p>
        </div>

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
