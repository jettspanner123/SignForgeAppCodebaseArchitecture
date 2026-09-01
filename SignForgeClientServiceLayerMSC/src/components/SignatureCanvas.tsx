import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Type, 
  Upload, 
  RotateCcw, 
  Check, 
  X, 
  ShieldCheck, 
  Lock,
  Sparkles
} from 'lucide-react';
import { SignatureType, SignatureData } from '../types';
import { generateSHA256, getSimulatedIP } from '../utils/crypto';

interface SignatureCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sig: SignatureData) => void;
  signerName: string;
  signerEmail: string;
  signerRole: 'CANDIDATE' | 'HR_REPRESENTATIVE';
}

const FONTS = [
  { name: 'Dancing Script', className: 'font-["Dancing_Script"] text-3xl' },
  { name: 'Great Vibes', className: 'font-["Great_Vibes"] text-4xl' },
  { name: 'Sacramento', className: 'font-["Sacramento"] text-4xl' },
  { name: 'Playfair Display', className: 'font-["Playfair_Display"] italic text-2xl' },
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
  const [activeTab, setActiveTab] = useState<SignatureType>('DRAW');
  const [typedName, setTypedName] = useState<string>(signerName || '');
  const [selectedFont, setSelectedFont] = useState<string>('Dancing Script');
  const [selectedInk, setSelectedInk] = useState<string>('#0f172a');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [hasAgreedTerms, setHasAgreedTerms] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnContent, setHasDrawnContent] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'DRAW') {
      setTimeout(initCanvas, 50);
    }
  }, [isOpen, activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution scale
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Fill canvas with clean white paper background so ink is 100% visible
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw baseline guide
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1';
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Create Electronic Signature</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">ESIGN Act §101 & eIDAS Cryptographically Compliant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body & Tabs */}
        <div className="p-6 space-y-5">
          
          {/* Signer Info Badge */}
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Signer Identity: </span>
              <span className="font-bold text-slate-900 dark:text-white">{signerName}</span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">({signerEmail})</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              {signerRole === 'CANDIDATE' ? 'Candidate' : 'HR Officer'}
            </span>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('DRAW')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'DRAW'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Draw Signature</span>
            </button>

            <button
              onClick={() => setActiveTab('TYPE')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'TYPE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Type Signature</span>
            </button>

            <button
              onClick={() => setActiveTab('UPLOAD')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'UPLOAD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Image</span>
            </button>
          </div>

          {/* TAB 1: DRAW CANVAS */}
          {activeTab === 'DRAW' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                <span>Sign inside the box using mouse or finger:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Ink:</span>
                  {INK_COLORS.map((ink) => (
                    <button
                      key={ink.hex}
                      onClick={() => {
                        setSelectedInk(ink.hex);
                        if (canvasRef.current) {
                          const ctx = canvasRef.current.getContext('2d');
                          if (ctx) ctx.strokeStyle = ink.hex;
                        }
                      }}
                      className={`h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 transition-transform ${
                        selectedInk === ink.hex ? 'scale-125 ring-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: ink.hex }}
                      title={ink.name}
                    />
                  ))}
                  <button
                    onClick={clearCanvas}
                    className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold ml-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Signature Paper Canvas Frame */}
              <div className="relative bg-white rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 transition-colors h-44 overflow-hidden shadow-inner">
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Type Your Legal Full Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Samantha R. Taylor"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Choose Signature Font Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => setSelectedFont(font.name)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-center min-h-[70px] transition-all ${
                        selectedFont === font.name
                          ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500 ring-1 ring-blue-500 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Transparent Signature Image (PNG/JPG)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-950 hover:border-blue-500 transition-colors">
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Signature"
                      className="max-h-24 mx-auto object-contain bg-white p-2 rounded-lg border border-slate-200 shadow-sm"
                    />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                    >
                      Remove & Choose Different Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">Click to browse or drag file here</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Recommended: PNG with transparent background</p>
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
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="legal-agree"
              checked={hasAgreedTerms}
              onChange={(e) => setHasAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="legal-agree" className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug font-medium">
              I agree that applying my electronic signature constitutes a legally binding execution under the ESIGN Act of 2000 and UETA rules, with full legal weight equivalent to an ink signature.
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSaveSignature}
            disabled={
              !hasAgreedTerms ||
              (activeTab === 'DRAW' && !hasDrawnContent) ||
              (activeTab === 'TYPE' && !typedName.trim()) ||
              (activeTab === 'UPLOAD' && !uploadedImage)
            }
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Apply Electronic Signature</span>
          </button>
        </div>

      </div>
    </div>
  );
};
