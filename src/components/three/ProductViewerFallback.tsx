'use client';

import { useState } from 'react';
import { Box, RotateCcw } from 'lucide-react';

interface ProductViewerFallbackProps {
  productType: string;
  color: string;
  material: string;
  engraving: string;
  className?: string;
}

export default function ProductViewerFallback({
  productType,
  color,
  material,
  engraving,
  className = 'h-[400px] w-full',
}: ProductViewerFallbackProps) {
  const [rotation, setRotation] = useState(0);

  return (
    <div
      className={`rounded-xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center relative cursor-grab active:cursor-grabbing select-none ${className}`}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        setRotation(x * 360);
      }}
    >
      <div
        className="transition-transform duration-200"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        <div
          className="w-32 h-32 rounded-2xl shadow-2xl flex items-center justify-center"
          style={{
            background: color,
            boxShadow: material === 'metallic'
              ? `0 20px 60px ${color}66, inset 0 2px 4px rgba(255,255,255,0.3)`
              : material === 'glossy'
              ? `0 20px 60px ${color}44, inset 0 2px 8px rgba(255,255,255,0.4)`
              : `0 10px 40px ${color}33`,
          }}
        >
          {engraving ? (
            <span className="text-white/80 text-sm font-light tracking-wider">{engraving}</span>
          ) : (
            <Box className="w-12 h-12 text-white/60" />
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" />
        Drag to rotate preview
      </div>

      <div className="absolute top-3 right-3">
        <span className="text-[10px] uppercase tracking-wider bg-muted px-2 py-1 rounded-full text-muted-foreground">
          {material}
        </span>
      </div>
    </div>
  );
}
