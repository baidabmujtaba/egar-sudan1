import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ files, onChange, maxFiles = 5 }: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles).slice(0, maxFiles - files.length);
    const updated = [...files, ...arr];
    onChange(updated);

    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [files, maxFiles, onChange]);

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">صور العقار (حتى {maxFiles} صور)</label>
      <div className="grid grid-cols-3 gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute top-1 left-1 bg-destructive rounded-full p-1"
            >
              <X className="h-3 w-3 text-destructive-foreground" />
            </button>
          </div>
        ))}
        {files.length < maxFiles && (
          <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-1">إضافة</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
