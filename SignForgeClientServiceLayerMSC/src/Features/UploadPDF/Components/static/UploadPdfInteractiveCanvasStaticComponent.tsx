import React, { useRef, useState } from 'react';
import { 
  FileSignature, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  User, 
  X, 
  Move,
  FileText
} from 'lucide-react';
import { OfferDocumentField, OfferDocumentFieldType } from '../../../../Types';
import ApplicationHapticsUtility from '../../../../Utilities/ApplicationHapticsUtility';

export interface UploadPdfInteractiveCanvasStaticComponentProps {
  pdfUrl: string;
  pdfFileName: string;
  fields: OfferDocumentField[];
  onAddField: (field: OfferDocumentField) => void;
  onUpdateFieldPosition: (id: string, xPercent: number, yPercent: number) => void;
  onRemoveField: (id: string) => void;
  draggingTagType: OfferDocumentFieldType | null;
  setDraggingTagType: (type: OfferDocumentFieldType | null) => void;
}

export default function UploadPdfInteractiveCanvasStaticComponent({
  pdfUrl,
  pdfFileName,
  fields,
  onAddField,
  onUpdateFieldPosition,
  onRemoveField,
  draggingTagType,
  setDraggingTagType,
}: UploadPdfInteractiveCanvasStaticComponentProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDraggingFieldId, setActiveDraggingFieldId] = useState<string | null>(null);

  const getTagMeta = (type: OfferDocumentFieldType) => {
    switch (type) {
      case 'CANDIDATE_SIGNATURE':
        return {
          icon: <FileSignature className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Candidate Signature',
          borderClass: 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-emerald-950/50',
          badgeClass: 'bg-emerald-500 text-slate-950',
        };
      case 'HR_SIGNATURE':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />,
          label: 'HR Countersign',
          borderClass: 'border-indigo-500 bg-indigo-950/80 text-indigo-300 shadow-indigo-950/50',
          badgeClass: 'bg-indigo-500 text-white',
        };
      case 'DIRECTOR_SIGNATURE':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Director Seal',
          borderClass: 'border-amber-500 bg-amber-950/80 text-amber-300 shadow-amber-950/50',
          badgeClass: 'bg-amber-500 text-slate-950',
        };
      case 'DATE_SIGNED':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-teal-400" />,
          label: 'Date Signed',
          borderClass: 'border-teal-500 bg-teal-950/80 text-teal-300 shadow-teal-950/50',
          badgeClass: 'bg-teal-500 text-slate-950',
        };
      case 'FULL_NAME':
        return {
          icon: <User className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Full Name',
          borderClass: 'border-purple-500 bg-purple-950/80 text-purple-300 shadow-purple-950/50',
          badgeClass: 'bg-purple-500 text-white',
        };
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 text-slate-400" />,
          label: 'Custom Field',
          borderClass: 'border-slate-500 bg-slate-950/80 text-slate-300',
          badgeClass: 'bg-slate-500 text-white',
        };
    }
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    const xPercent = Math.max(2, Math.min(85, Math.round(rawX)));
    const yPercent = Math.max(2, Math.min(92, Math.round(rawY)));

    // Case 1: Repositioning an existing tag
    if (activeDraggingFieldId) {
      onUpdateFieldPosition(activeDraggingFieldId, xPercent, yPercent);
      setActiveDraggingFieldId(null);
      ApplicationHapticsUtility.current.triggerHapticFeedback(12);
      return;
    }

    // Case 2: Dropping a new tag from Tag Palette
    const tagType = (e.dataTransfer.getData('text/plain') as OfferDocumentFieldType) || draggingTagType;
    if (tagType) {
      const meta = getTagMeta(tagType);
      const newField: OfferDocumentField = {
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: tagType,
        label: meta.label,
        page: 1,
        xPercent,
        yPercent,
        widthPercent: 28,
        heightPercent: 6,
        required: true,
        assignedTo: 
          tagType === 'HR_SIGNATURE' ? 'HR' :
          tagType === 'DIRECTOR_SIGNATURE' ? 'DIRECTOR' : 'CANDIDATE',
      };
      onAddField(newField);
      setDraggingTagType(null);
      ApplicationHapticsUtility.current.triggerHapticFeedback(15);
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
      className="relative w-full h-[620px] sm:h-[660px] bg-slate-900 rounded-lg overflow-hidden select-none border border-slate-800"
    >
      {/* Background Embedded PDF Renderer */}
      <object
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full pointer-events-none rounded-lg bg-white"
      >
        <div className="p-8 text-center text-slate-300">
          <p className="font-bold text-sm">PDF Document: {pdfFileName}</p>
        </div>
      </object>

      {/* Interactive Placed Tags Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        {fields.map((field) => {
          const meta = getTagMeta(field.type);
          return (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => {
                setActiveDraggingFieldId(field.id);
                e.dataTransfer.setData('text/plain', field.id);
                ApplicationHapticsUtility.current.triggerHapticFeedback(10);
              }}
              style={{
                left: `${field.xPercent}%`,
                top: `${field.yPercent}%`,
              }}
              className={`absolute cursor-move group p-2 rounded-lg border-2 border-dashed shadow-lg backdrop-blur-sm transition-transform active:scale-95 flex items-center justify-between gap-2 min-w-[150px] ${meta.borderClass}`}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Move className="w-3 h-3 text-slate-400 group-hover:text-white shrink-0" />
                {meta.icon}
                <div className="flex flex-col truncate">
                  <span className="text-[11px] font-mono font-bold leading-tight truncate">
                    {field.label}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 leading-none">
                    X:{field.xPercent}% Y:{field.yPercent}%
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  ApplicationHapticsUtility.current.triggerHapticFeedback(12);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveField(field.id);
                }}
                className="w-4 h-4 rounded bg-slate-800/80 hover:bg-rose-500 hover:text-white text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Remove Tag"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Guide Overlay when zero tags placed */}
      {fields.length === 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-slate-950/30 backdrop-blur-[1px]">
          <div className="bg-slate-950/90 border border-slate-700 rounded-xl px-4 py-3 text-center shadow-2xl space-y-1 max-w-xs">
            <p className="text-xs font-bold text-slate-200 font-mono">No eSign Tags Placed</p>
            <p className="text-[11px] text-slate-400">
              Drag tags from the top bar or click &quot;Auto-Place Standard Tags&quot; to position signature boxes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
