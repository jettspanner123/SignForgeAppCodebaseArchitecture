import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Type, 
  Upload, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Lock,
  UserCheck
} from 'lucide-react';
import { SignatureType, SignatureData } from '../Types';
import { generateSHA256, getSimulatedIP } from '../utils/crypto';
import { motion } from 'motion/react';
import ModalSharedComponent from '../Shared/Components/ModalSharedComponent';
import ButtonSharedComponent from '../Shared/Components/ButtonSharedComponent';
import PrimaryActionButtonSharedComponent from '../Shared/Components/PrimaryActionButtonSharedComponent';
import { triggerHapticFeedback } from '../utils/haptics';

interface SignatureCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sig: SignatureData) => void;
  signerName: string;
  signerEmail: string;
  signerRole: 'CANDIDATE' | 'HR_REPRESENTATIVE';
}

const FONTS = [
  { name: 'Caveat', label: 'Natural Handwriting', className: 'font-["Caveat"] text-3xl font-semibold' },
  { name: 'Dancing Script', label: 'Fluid Signature', className: 'font-["Dancing_Script"] text-2xl font-bold' },
  { name: 'Great Vibes', label: 'Flourished Script', className: 'font-["Great_Vibes"] text-3xl' },
  { name: 'Homemade Apple', label: 'Organic Ink Pen', className: 'font-["Homemade_Apple"] text-xl' },
];

const INK_COLORS = [
  { name: 'Corporate Navy', hex: '#0f172a' },
  { name: 'Enterprise Blue', hex: '#1d4ed8' },
  { name: 'Formal Black', hex: '#020617' },
];

export const SignatureCanvasModal: React.FC<SignatureCanvasProps> = ({
  isOpen,
  onClose,
  onSave,
  signerName,
  signerEmail,
  signerRole,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const [exitDirection, setExitDirection] = useState<'down' | 'up'>('down');
  const [activeTab, setActiveTab] = useState<SignatureType>('DRAW');
  const [typedName, setTypedName] = useState<string>(signerName || '');
  const [selectedFont, setSelectedFont] = useState<string>('Caveat');
  const [selectedInk, setSelectedInk] = useState<string>('#0f172a');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [hasAgreedTerms, setHasAgreedTerms] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnContent, setHasDrawnContent] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setInternalIsOpen(isOpen);
    if (isOpen) {
      setExitDirection('down');
    }
  }, [isOpen]);

  // Initialize canvas when modal opens or tab changes to DRAW
  useEffect(() => {
    if (internalIsOpen && activeTab === 'DRAW') {
      const timer = setTimeout(initCanvas, 60);
      return () => clearTimeout(timer);
    }
  }, [internalIsOpen, activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution scale
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Fill canvas with clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw baseline guide
    ctx.beginPath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.moveTo(20, rect.height - 30);
    ctx.lineTo(rect.width - 20, rect.height - 30);
    ctx.stroke();

    ctx.strokeStyle = selectedInk;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const clearCanvas = () => {
    initCanvas();
    setHasDrawnContent(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnContent(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Touch Support for mobile candidates
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnContent(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderOrBackdropClose = () => {
    setExitDirection('down');
    setInternalIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 550);
  };

  const handleFooterClose = () => {
    setExitDirection('down');
    setInternalIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 550);
  };

  const handleSaveSignature = async () => {
    let sigValue = '';

    if (activeTab === 'DRAW') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawnContent) return;
      sigValue = canvas.toDataURL('image/png');
    } else if (activeTab === 'TYPE') {
      if (!typedName.trim()) return;
      sigValue = typedName.trim();
    } else if (activeTab === 'UPLOAD') {
      if (!uploadedImage) return;
      sigValue = uploadedImage;
    }

    const timestamp = new Date().toISOString();
    const ipAddress = getSimulatedIP();
    const userAgent = navigator.userAgent;

    // Generate SHA-256 for audit signature log
    const hashPayload = `${sigValue}-${signerEmail}-${timestamp}-${ipAddress}`;
    const sha256Hash = await generateSHA256(hashPayload);

    const sigData: SignatureData = {
      type: activeTab,
      value: sigValue,
      fontFamily: activeTab === 'TYPE' ? selectedFont : undefined,
      signedBy: signerName,
      email: signerEmail,
      role: signerRole,
      timestamp,
      ipAddress,
      userAgent,
      sha256Hash
    };

    onSave(sigData);
    handleHeaderOrBackdropClose();
  };

  const isSaveDisabled =
    !hasAgreedTerms ||
    (activeTab === 'DRAW' && !hasDrawnContent) ||
    (activeTab === 'TYPE' && !typedName.trim()) ||
    (activeTab === 'UPLOAD' && !uploadedImage);

  return (
    <ModalSharedComponent
      isOpen={internalIsOpen}
      onClose={handleHeaderOrBackdropClose}
      exitDirection={exitDirection}
      headerCloseDirection="down"
      title="Create Electronic Signature"
      subtitle="ESIGN Act §101 & eIDAS Cryptographically Compliant"
      maxWidth="2xl"
      footer={
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-3 w-full">
          <ButtonSharedComponent
            variant="outline"
            size="md"
            onClick={handleFooterClose}
            className="w-full sm:w-auto justify-center"
          >
            Cancel
          </ButtonSharedComponent>
          
          <PrimaryActionButtonSharedComponent
            label="Apply Signature"
            size="md"
            icon={<Check className="w-3.5 h-3.5 !text-white" />}
            disabled={isSaveDisabled}
            onClick={handleSaveSignature}
            className="w-full sm:w-auto justify-center"
          />
        </div>
      }
    >
      <div className="space-y-5">
        
        {/* Signer Identity Bar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-slate-500 dark:text-zinc-400">Signer Identity:</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 truncate">{signerName}</span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 hidden sm:inline truncate">({signerEmail})</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 shrink-0">
            {signerRole === 'CANDIDATE' ? 'Candidate' : 'HR Officer'}
          </span>
        </div>

        {/* Segmented Capsule Tabs (1:1 AssetSphere Animated Segmented Controller) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 h-11 sm:h-9 w-full">
          <button
            type="button"
            onPointerDown={() => triggerHapticFeedback(12)}
            onClick={() => setActiveTab('DRAW')}
            className={`relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none ${
              activeTab === 'DRAW' ? 'bg-white dark:bg-zinc-700 shadow-xs sm:bg-transparent sm:dark:bg-transparent sm:shadow-none' : ''
            }`}
          >
            {activeTab === 'DRAW' && (
              <motion.div
                layoutId="activeSignatureTabPill"
                className="hidden sm:block absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DRAW'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}>
              <PenTool className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Draw</span>
            </span>
          </button>

          <button
            type="button"
            onPointerDown={() => triggerHapticFeedback(12)}
            onClick={() => setActiveTab('TYPE')}
            className={`relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none ${
              activeTab === 'TYPE' ? 'bg-white dark:bg-zinc-700 shadow-xs sm:bg-transparent sm:dark:bg-transparent sm:shadow-none' : ''
            }`}
          >
            {activeTab === 'TYPE' && (
              <motion.div
                layoutId="activeSignatureTabPill"
                className="hidden sm:block absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'TYPE'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}>
              <Type className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Text</span>
            </span>
          </button>

          <button
            type="button"
            onPointerDown={() => triggerHapticFeedback(12)}
            onClick={() => setActiveTab('UPLOAD')}
            className={`relative flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 h-9 sm:h-7 rounded-lg sm:rounded-md text-xs font-bold transition-colors cursor-pointer select-none ${
              activeTab === 'UPLOAD' ? 'bg-white dark:bg-zinc-700 shadow-xs sm:bg-transparent sm:dark:bg-transparent sm:shadow-none' : ''
            }`}
          >
            {activeTab === 'UPLOAD' && (
              <motion.div
                layoutId="activeSignatureTabPill"
                className="hidden sm:block absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg sm:rounded-md shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'UPLOAD'
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}>
              <Upload className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Upload</span>
            </span>
          </button>
        </div>

        {/* TAB 1: DRAW CANVAS */}
        {activeTab === 'DRAW' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-zinc-300">
              <span className="font-medium text-xs">Sign inside the canvas box:</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 font-bold">Ink:</span>
                <div className="flex items-center gap-1">
                  {INK_COLORS.map((ink) => (
                    <button
                      key={ink.hex}
                      type="button"
                      onClick={() => {
                        setSelectedInk(ink.hex);
                        if (canvasRef.current) {
                          const ctx = canvasRef.current.getContext('2d');
                          if (ctx) ctx.strokeStyle = ink.hex;
                        }
                      }}
                      className={`h-4.5 w-4.5 rounded-full border border-slate-300 dark:border-zinc-700 transition-transform cursor-pointer ${
                        selectedInk === ink.hex ? 'scale-125 ring-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: ink.hex }}
                      title={ink.name}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium ml-2 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Signature Paper Canvas Frame */}
            <div className="relative bg-white rounded-xl border border-slate-200/80 dark:border-zinc-800 hover:border-blue-500 transition-colors h-44 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="w-full h-full cursor-crosshair touch-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: TYPE SIGNATURE */}
        {activeTab === 'TYPE' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                Type Your Legal Full Name
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="e.g. Samantha R. Taylor"
                className="w-full h-10 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-lg px-3.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0C2086] dark:focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
                Choose Signature Font Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FONTS.map((font) => (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => setSelectedFont(font.name)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-center min-h-[70px] transition-all cursor-pointer ${
                      selectedFont === font.name
                        ? 'bg-blue-500/10 border-[#0C2086] dark:border-blue-500 ring-1 ring-[#0C2086] dark:ring-blue-500 text-slate-900 dark:text-zinc-100'
                        : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono font-bold uppercase tracking-wider mb-1">
                      {font.name}
                    </span>
                    <span className={font.className} style={{ color: selectedInk }}>
                      {typedName || signerName || 'Your Signature'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD IMAGE */}
        {activeTab === 'UPLOAD' && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
              Upload Transparent Signature Image (PNG/JPG)
            </label>
            <div className="relative border-2 border-dashed border-slate-200/80 dark:border-zinc-800 rounded-xl p-6 text-center bg-slate-50 dark:bg-zinc-900/40 hover:border-blue-500 transition-colors">
              {uploadedImage ? (
                <div className="space-y-3">
                  <img
                    src={uploadedImage}
                    alt="Uploaded Signature"
                    className="max-h-24 mx-auto object-contain bg-white p-2 rounded-lg border border-slate-200 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Remove & Choose Different Image
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-800 dark:text-zinc-200 font-bold">Click to browse or drag file here</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Recommended: PNG with transparent background</p>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legal Acknowledgement Checkbox */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="legal-agree"
            checked={hasAgreedTerms}
            onChange={(e) => setHasAgreedTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#0C2086] focus:ring-[#0C2086] h-4 w-4 cursor-pointer"
          />
          <label htmlFor="legal-agree" className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug cursor-pointer">
            I agree that applying my electronic signature constitutes a legally binding execution under the ESIGN Act of 2000 and UETA rules, with full legal weight equivalent to an ink signature.
          </label>
        </div>

      </div>
    </ModalSharedComponent>
  );
};
export default SignatureCanvasModal;
