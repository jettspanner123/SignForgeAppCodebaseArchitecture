import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { OfferDocumentField, OfferDocumentFieldType } from '../../../../Types';
import UploadPdfTagPaletteStaticComponent from './UploadPdfTagPaletteStaticComponent';
import UploadPdfInteractiveCanvasStaticComponent from './UploadPdfInteractiveCanvasStaticComponent';

export interface UploadPdfViewerStaticComponentProps {
  pdfUrl: string | null;
  pdfFileName: string;
  signatureCount: 2 | 3;
  fields: OfferDocumentField[];
  onAddField: (field: OfferDocumentField) => void;
  onUpdateFieldPosition: (id: string, xPercent: number, yPercent: number) => void;
  onRemoveField: (id: string) => void;
  onAutoPlaceDefaults: () => void;
}

export default function UploadPdfViewerStaticComponent({
  pdfUrl,
  pdfFileName,
  signatureCount,
  fields,
  onAddField,
  onUpdateFieldPosition,
  onRemoveField,
  onAutoPlaceDefaults,
}: UploadPdfViewerStaticComponentProps): React.JSX.Element {
  const [draggingTagType, setDraggingTagType] = useState<OfferDocumentFieldType | null>(null);

  const handleTagDragStart = (e: React.DragEvent, tagType: OfferDocumentFieldType) => {
    e.dataTransfer.setData('text/plain', tagType);
    setDraggingTagType(tagType);
  };

  return (
    <div className="space-y-3">
      {/* 1. Floating Capsule Tag Palette (Visible when PDF is loaded) */}
      {pdfUrl && (
        <UploadPdfTagPaletteStaticComponent
          signatureCount={signatureCount}
          onAutoPlaceDefaults={onAutoPlaceDefaults}
          onTagDragStart={handleTagDragStart}
        />
      )}

      {/* 2. Document Canvas Container */}
      <div className="rounded-xl border border-slate-700 dark:border-zinc-800 bg-slate-900 overflow-hidden shadow-xl min-h-[640px] flex flex-col relative">
        {pdfUrl ? (
          <div className="flex-1 flex flex-col h-full relative">
            {/* Embedded Top Status Bar */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="truncate max-w-[260px] font-mono text-slate-200">
                {pdfFileName}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  {fields.length} {fields.length === 1 ? 'Tag Placed' : 'Tags Placed'}
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  PDF LOADED
                </span>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="p-2">
              <UploadPdfInteractiveCanvasStaticComponent
                pdfUrl={pdfUrl}
                pdfFileName={pdfFileName}
                fields={fields}
                onAddField={onAddField}
                onUpdateFieldPosition={onUpdateFieldPosition}
                onRemoveField={onRemoveField}
                draggingTagType={draggingTagType}
                setDraggingTagType={setDraggingTagType}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3 min-h-[640px]">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
              <Upload className="w-7 h-7 text-slate-500" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm font-sans">No PDF Selected</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Upload your PDF on the left or click &quot;Use Demo PDF Sample&quot; to begin tagging eSign coordinates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
