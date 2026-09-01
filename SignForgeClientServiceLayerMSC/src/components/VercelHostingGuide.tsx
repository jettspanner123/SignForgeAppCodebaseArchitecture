import React, { useState } from 'react';
import { 
  Server, 
  Cloud, 
  ShieldCheck, 
  Globe, 
  Terminal, 
  Copy, 
  Check, 
  Lock, 
  Mail, 
  Database,
  Zap,
  Cpu,
  ExternalLink
} from 'lucide-react';

export const VercelHostingGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const vercelSteps = [
    {
      step: '1. Version Control & GitHub Repository',
      desc: 'Commit and push your eSignature application codebase to GitHub or GitLab.',
      code: `git init\ngit add .\ngit commit -m "Initial SignCorp Enterprise eSignature release"\ngit remote add origin https://github.com/your-org/signcorp-esign.git\ngit push -u origin main`
    },
    {
      step: '2. One-Click Deploy on Vercel Free Tier',
      desc: 'Connect your GitHub repo to Vercel. Vercel automatically detects Vite/React and builds static SPA + Serverless functions.',
      code: `# Install Vercel CLI locally (Optional)\nnpm i -g vercel\nvercel login\nvercel --prod`
    },
    {
      step: '3. Environment Variables Configuration',
      desc: 'Set up secrets in Vercel Dashboard -> Project Settings -> Environment Variables.',
      code: `RESEND_API_KEY="re_1234567890..." # Free tier 3,000 emails/mo\nSUPABASE_URL="https://xxx.supabase.co"\nSUPABASE_ANON_KEY="eyJhbGci..."\nHR_HEAD_EMAIL="hr-head@company.com"\nCTO_EMAIL="cto@company.com"\nAPP_URL="https://signcorp.vercel.app"`
    },
    {
      step: '4. Free Backend Storage & Email Stack',
      desc: 'Enterprise free tier stack recommendation:',
      code: `• Frontend & API Routes: Vercel (Free 100GB Bandwidth)\n• PDF Storage: Supabase Storage / Cloudflare R2 (Free 10GB S3-compatible)\n• Email Engine: Resend / SendGrid (Free 3,000 emails/mo to HR Head & CTO)\n• Database Audit Trail: Supabase PostgreSQL (Free Tier 500MB DB)`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-800/50 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              EXECUTIVE DEPLOYMENT ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400">Zero-Cost Free Tier Guide</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
            Hosting on Vercel, Netlify & Free Cloud Platforms
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            How to run this enterprise eSignature app with real PDF storage, SHA-256 audit logs, and automated email dispatch at zero monthly cost.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-xl shadow-amber-600/30 transition-all"
          >
            <Server className="h-4 w-4" />
            <span>Deploy to Vercel Now</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
        </div>
      </div>

      {/* Architecture Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit border border-blue-500/20">
            <Server className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">1. Vercel Hosting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Host the React frontend and Node serverless functions on Vercel Hobby tier (Free forever). Binds custom domains, handles SSL certificates, and auto-deploys on every GitHub push.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">2. Supabase / R2 Storage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Store generated signed PDFs and audit logs in Supabase Storage or Cloudflare R2 (10GB Free S3 storage). Ensures signed PDFs are immutably archived with long-term signature validity.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit border border-indigo-500/20">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">3. Resend Email Dispatch</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use Resend (or SendGrid / AWS SES) to send transactional emails to candidates, HR Head, and CTO with attached encrypted executed PDFs once both parties eSign.
          </p>
        </div>

      </div>

      {/* Step by Step Setup Code Blocks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
          <Terminal className="h-5 w-5 text-amber-400" />
          <span>Step-by-Step Vercel Deployment Instructions</span>
        </h2>

        <div className="space-y-6">
          {vercelSteps.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-sm font-bold text-amber-400">{item.step}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
              
              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200">
                <button
                  onClick={() => copyCode(item.code, idx)}
                  className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 text-xs flex items-center space-x-1"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <pre className="whitespace-pre-wrap">{item.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Legal Compliance Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span>Enterprise Security & ESIGN Compliance Guarantee</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <p className="font-bold text-white">ESIGN Act & eIDAS Regulation Compliant</p>
            <p className="text-slate-400 text-[11px]">
              Captures Intent to Sign, Affirmative Opt-In Consent, UTC Time Stamping, IP Geolocation, and User-Agent signature verification.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <p className="font-bold text-white">SHA-256 Tamper-Evident Seals</p>
            <p className="text-slate-400 text-[11px]">
              Generates cryptographic checksum hashes for both the document binary and audit trail events, rendering any unauthorized post-sign modification immediately detected.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
