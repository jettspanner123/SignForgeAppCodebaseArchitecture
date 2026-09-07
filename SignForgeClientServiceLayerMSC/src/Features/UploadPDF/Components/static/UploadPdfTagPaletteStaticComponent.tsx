import React from 'react';
import { 
  FileSignature, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  User, 
  Sparkles, 
  GripHorizontal 
} from 'lucide-react';
import { OfferDocumentFieldType } from '../../../../Types';
import ApplicationHapticsUtility from '../../../../Utilities/ApplicationHapticsUtility';

export interface TagPaletteItem {
  type: OfferDocumentFieldType;
  label: string;
  assignedTo: 'CANDIDATE' | 'HR' | 'DIRECTOR';
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export interface UploadPdfTagPaletteStaticComponentProps {
  signatureCount: 2 | 3;
  onAutoPlaceDefaults: () => void;
  onTagDragStart: (e: React.DragEvent, tagType: OfferDocumentFieldType) => void;
}

export default function UploadPdfTagPaletteStaticComponent({
  signatureCount,
  onAutoPlaceDefaults,
  onTagDragStart,
}: UploadPdfTagPaletteStaticComponentProps): React.JSX.Element {
  const paletteItems: TagPaletteItem[] = [
    {
      type: 'CANDIDATE_SIGNATURE',
      label: 'Candidate Sign',
      assignedTo: 'CANDIDATE',
      icon: <FileSignature className="w-3.5 h-3.5" />,
      bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      borderClass: 'border-emerald-500/60',
      textClass: 'text-emerald-400',
    },
    {
      type: 'HR_SIGNATURE',
      label: 'HR Countersign',
      assignedTo: 'HR',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      bgClass: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      borderClass: 'border-indigo-500/60',
      textClass: 'text-indigo-400',
    },
    ...(signatureCount === 3 ? [{
      type: 'DIRECTOR_SIGNATURE' as OfferDocumentFieldType,
      label: 'Director Seal',
      assignedTo: 'DIRECTOR' as const,
      icon: <UserCheck className="w-3.5 h-3.5" />,
      bgClass: 'bg-amber-500/10 hover:bg-amber-500/20',
      borderClass: 'border-amber-500/60',
      textClass: 'text-amber-400',
    }] : []),
    {
      type: 'DATE_SIGNED',
      label: 'Date Signed',
      assignedTo: 'CANDIDATE',
      icon: <Calendar className="w-3.5 h-3.5" />,
      bgClass: 'bg-teal-500/10 hover:bg-teal-500/20',
      borderClass: 'border-teal-500/60',
      textClass: 'text-teal-400',
    },
    {
      type: 'FULL_NAME',
      label: 'Full Name',
      assignedTo: 'CANDIDATE',
      icon: <User className="w-3.5 h-3.5" />,
      bgClass: 'bg-purple-500/10 hover:bg-purple-500/20',
      borderClass: 'border-purple-500/60',
      textClass: 'text-purple-400',
    },
  ];

  return (
    <div className="p-2.5 bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-2.5">
      {/* Draggable Tag Chips Strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-mono text-slate-400 font-semibold mr-1 flex items-center gap-1">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Drag Tags:</span>
        </span>

        {paletteItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => {
              ApplicationHapticsUtility.current.triggerHapticFeedback(10);
              onTagDragStart(e, item.type);
            }}
            onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(8)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed cursor-grab active:cursor-grabbing select-none transition-all ${item.bgClass} ${item.borderClass} ${item.textClass}`}
            title={`Drag ${item.label} tag onto the PDF`}
          >
            {item.icon}
            <span className="text-xs font-mono font-bold tracking-tight">{item.label}</span>
          </div>
        ))}
      </div>

      {/* 1-Click Auto-Place Defaults Action */}
      <button
        type="button"
        onPointerDown={() => ApplicationHapticsUtility.current.triggerHapticFeedback(12)}
        onClick={onAutoPlaceDefaults}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-mono font-bold transition-colors cursor-pointer select-none"
        title="Auto-place baseline signature tags onto document"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>Auto-Place Standard Tags</span>
      </button>
    </div>
  );
}
