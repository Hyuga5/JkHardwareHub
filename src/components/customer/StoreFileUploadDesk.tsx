import React, { useState, useRef } from 'react';
import { Shop } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Tag,
  Sparkles,
  Building,
  MapPin,
  Clock,
  Phone,
  Send,
  MessageCircle,
  AlertCircle,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UploadedFileItem {
  id: string;
  file: File | { name: string; size: number; type: string };
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

interface PromoCodeConfig {
  code: string;
  title: string;
  creatorName?: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  perks: string[];
  isInfluencer?: boolean;
}

const AVAILABLE_PROMO_CODES: Record<string, PromoCodeConfig> = {
  SISAN10: {
    code: 'SISAN10',
    title: '10% Sisan Baniya Creator Rebate',
    creatorName: 'Sisan Baniya (@sisanbaniya)',
    description: '10% creator discount on BOQ engineering & hardware supplies.',
    discountType: 'percentage',
    discountValue: 10,
    perks: ['10% BOQ Material Rebate', 'Priority Technical Estimation', 'Free Site Freight'],
    isInfluencer: true,
  },
  RONB10: {
    code: 'RONB10',
    title: '10% Routine of Nepal Banda Special',
    creatorName: 'Routine of Nepal Banda (RONB)',
    description: '10% verified community discount on hardware estimation.',
    discountType: 'percentage',
    discountValue: 10,
    perks: ['10% Material Quotation Off', 'Free Site Unloading'],
    isInfluencer: true,
  },
  PARAS10: {
    code: 'PARAS10',
    title: '10% Paras Khadka Creator Offer',
    creatorName: 'Paras Khadka Official',
    description: '10% rebate on structural cement, rebar, and construction quotes.',
    discountType: 'percentage',
    discountValue: 10,
    perks: ['10% Heavy Materials Off', 'Free Tata Ace Delivery within 10km'],
    isInfluencer: true,
  },
  ROTTENGUYS: {
    code: 'ROTTENGUYS',
    title: '12% Rotten Guys YouTube Collab',
    creatorName: 'The Rotten Guys',
    description: '12% creator promo code on all hardware & architectural bills.',
    discountType: 'percentage',
    discountValue: 12,
    perks: ['12% Off Total Bill', 'Direct Store WhatsApp Support'],
    isInfluencer: true,
  },
  TIKTOK10: {
    code: 'TIKTOK10',
    title: '10% TikTok Creator Partner Offer',
    creatorName: 'TikTok Nepal Creator Program',
    description: '10% promotion from our TikTok creator campaign.',
    discountType: 'percentage',
    discountValue: 10,
    perks: ['10% Instant Rebate', '13% IRD Tax Bill Included'],
    isInfluencer: true,
  },
  INSTA10: {
    code: 'INSTA10',
    title: '10% Instagram Influencer Collab',
    creatorName: 'Instagram Influencer Collabs',
    description: '10% discount on official BOQ quotation.',
    discountType: 'percentage',
    discountValue: 10,
    perks: ['10% Discount', 'Fast-Track Engineer Review'],
    isInfluencer: true,
  },
  BOQ10: {
    code: 'BOQ10',
    title: '10% BOQ & Engineering Discount',
    description: 'Get 10% off total estimated materials + Free Site Freight on full load.',
    discountType: 'percentage',
    discountValue: 10,
    perks: ['10% Material Discount', 'Free Site Unloading', 'Priority Estimation Queue'],
  },
  ESTIMATE10: {
    code: 'ESTIMATE10',
    title: '10% Estimate Quotation Offer',
    description: '10% direct discount on first bulk quotation through uploaded blueprint.',
    discountType: 'percentage',
    discountValue: 10,
    perks: ['10% Quotation Off', 'Free Tata Ace Delivery within 10km'],
  },
  BUILDERVIP: {
    code: 'BUILDERVIP',
    title: 'VIP Builder Voucher (NPR 2,500 Off)',
    description: 'Flat Rs 2,500 discount on projects over Rs 50,000 + 24hr engineer review.',
    discountType: 'fixed',
    discountValue: 2500,
    minOrder: 50000,
    perks: ['NPR 2,500 Cash Rebate', 'Dedicated Account Manager', '24h Turnaround'],
  },
  NEPAL2081: {
    code: 'NEPAL2081',
    title: 'New Fiscal Year Construction Grant',
    description: 'Flat NPR 1,000 discount on all material deliveries for FY 2081/82.',
    discountType: 'fixed',
    discountValue: 1000,
    perks: ['NPR 1,000 Instant Discount', 'Free Site Delivery'],
  },
  DARAZ50: {
    code: 'DARAZ50',
    title: '5% Instant Cash Voucher',
    description: '5% immediate rebate on all hardware, plumbing, and structural items.',
    discountType: 'percentage',
    discountValue: 5,
    perks: ['5% Instant Cash Rebate', '13% IRD Tax Bill Included'],
  },
  FIRSTESTIMATE: {
    code: 'FIRSTESTIMATE',
    title: 'Free On-Site Material Take-off',
    description: 'Complimentary site measurement visit by technician + Rs 500 voucher.',
    discountType: 'fixed',
    discountValue: 500,
    perks: ['NPR 500 Credit', 'Free On-Site Inspection & Guidance'],
  },
};

function resolveUploadPromoCode(rawCode: string): PromoCodeConfig | null {
  const clean = rawCode.trim().toUpperCase().replace(/^@/, '');
  if (!clean) return null;

  if (AVAILABLE_PROMO_CODES[clean]) {
    return AVAILABLE_PROMO_CODES[clean];
  }

  if (clean.length >= 3) {
    const numMatch = clean.match(/(\d+)$/);
    const percentVal = numMatch ? Math.min(30, Math.max(5, parseInt(numMatch[1], 10))) : 10;
    return {
      code: clean,
      title: `${percentVal}% Social Media Creator Partner Discount`,
      creatorName: `@${clean.toLowerCase()} Influencer Collab`,
      description: `Verified social media influencer partner promo code (${percentVal}% creator discount).`,
      discountType: 'percentage',
      discountValue: percentVal,
      perks: [`${percentVal}% Material Discount`, 'Free Site Freight', 'Priority Engineer Review'],
      isInfluencer: true,
    };
  }

  return null;
}

interface StoreFileUploadDeskProps {
  shop: Shop;
}

export const StoreFileUploadDesk: React.FC<StoreFileUploadDeskProps> = ({ shop }) => {
  const { customerName, customerPhone, loyaltyProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload State
  const [files, setFiles] = useState<UploadedFileItem[]>([
    {
      id: 'sample-1',
      file: { name: 'Ground_Floor_Structural_Drawing_v2.dwg', size: 3450000, type: 'application/acad' },
      name: 'Ground_Floor_Structural_Drawing_v2.dwg',
      size: 3450000,
      type: 'dwg',
    },
    {
      id: 'sample-2',
      file: { name: 'Civil_BOQ_Material_Schedule.xlsx', size: 1280000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      name: 'Civil_BOQ_Material_Schedule.xlsx',
      size: 1280000,
      type: 'xlsx',
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);

  // Project Details State
  const [projectName, setProjectName] = useState('3-Storey Residential House Construction');
  const [siteLocation, setSiteLocation] = useState('Baneshwor Ward 10, Near Civil Service Hospital');
  const [constructionPhase, setConstructionPhase] = useState('Foundation & Pillar Casting');
  const [deliveryUrgency, setDeliveryUrgency] = useState('Within 2-3 Days');
  const [contactPerson, setContactPerson] = useState(customerName || 'Bikram Shrestha');
  const [contactNumber, setContactNumber] = useState(customerPhone || '9841234567');
  const [budgetRange, setBudgetRange] = useState('Rs 5,00,000 - Rs 15,00,000');
  const [additionalNotes, setAdditionalNotes] = useState(
    'Need 400 bags OPC 53 grade cement (Jagdamba/Shivam), 4.5 MT 12mm & 16mm TMT rebar (Hama/Panchakanya), and CPVC fittings as per attached schedule.'
  );

  // Promo Code State
  const [promoInput, setPromoInput] = useState('SISAN10');
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeConfig | null>(AVAILABLE_PROMO_CODES['SISAN10']);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(
    '✓ Influencer Code "SISAN10" Applied: 10% Creator Discount (@sisanbaniya) + Free Site Freight!'
  );

  // Points for Discount State
  const userAvailablePoints = Math.max(750, loyaltyProfile.pointsBalance || 750);
  const [redeemedPoints, setRedeemedPoints] = useState<number>(250);
  const [customPointsInput, setCustomPointsInput] = useState<string>('250');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketNumber: string;
    submittedAt: string;
    filesCount: number;
    promoCode?: string;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (uploadedList: FileList | File[]) => {
    const newItems: UploadedFileItem[] = [];
    Array.from(uploadedList).forEach((file) => {
      let ext = file.name.split('.').pop()?.toLowerCase() || 'file';
      let previewUrl: string | undefined = undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
      newItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        name: file.name,
        size: file.size,
        type: ext,
        previewUrl,
      });
    });

    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim();
    setPromoError(null);
    setPromoSuccessMsg(null);

    if (!code) {
      setPromoError('Please enter a promo code or influencer partner code');
      return;
    }

    const config = resolveUploadPromoCode(code);
    if (config) {
      setAppliedPromo(config);
      setPromoInput(config.code);
      if (config.isInfluencer) {
        setPromoSuccessMsg(
          `✓ Influencer Partner Code "${config.code}" Applied! ${config.title} (${config.creatorName || 'Verified Creator Collab'})`
        );
      } else {
        setPromoSuccessMsg(`✓ Promo Code "${config.code}" Applied! ${config.title}`);
      }
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      } catch {}
    } else {
      setPromoError(`Promo code "${code}" is invalid. Please check the spelling or enter a creator partner code.`);
      setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
    setPromoSuccessMsg(null);
  };

  const handleSelectPoints = (pts: number) => {
    const clamped = Math.min(pts, userAvailablePoints);
    setRedeemedPoints(clamped);
    setCustomPointsInput(clamped.toString());
  };

  const handleCustomPointsChange = (val: string) => {
    setCustomPointsInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setRedeemedPoints(Math.min(parsed, userAvailablePoints));
    } else if (val === '') {
      setRedeemedPoints(0);
    }
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please upload at least one BOQ document, blueprint drawing, or material list.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketNo = `BOQ-EST-${shop.name.substring(0, 3).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      setSubmittedTicket({
        ticketNumber: ticketNo,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        filesCount: files.length,
        promoCode: appliedPromo?.code,
      });
      setIsSubmitting(false);

      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.5 } });
      } catch {}
    }, 900);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (['xlsx', 'xls', 'csv'].includes(type)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (['png', 'jpg', 'jpeg', 'webp'].includes(type)) {
      return <ImageIcon className="w-5 h-5 text-indigo-600" />;
    }
    if (['dwg', 'dxf', 'cad'].includes(type)) {
      return <FileCode className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div id="store-file-upload-section" className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Engineering & Contractor Desk
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                IRD 13% Tax Estimate
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Upload className="w-6 h-6 text-orange-400" />
              <span>Upload Bill of Quantities (BOQ) & Site Blueprints</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload your architectural CAD drawings, Excel BOQ sheets, or handwritten site requirement lists for{' '}
              <strong className="text-white">{shop.name}</strong>. Our engineering estimation desk will verify stock,
              calculate wholesale rates with 13% VAT, and apply your exclusive promo code discount.
            </p>
          </div>

          {/* Store Verification Card */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-1.5 shrink-0 min-w-56">
            <div className="flex items-center gap-2 text-xs font-black text-slate-200">
              <Building className="w-4 h-4 text-orange-400" />
              <span className="truncate">{shop.name}</span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              PAN: {shop.panVatNumber}
            </p>
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-300 border-t border-slate-700/80">
              <span>Avg Estimate Response:</span>
              <span className="font-bold text-amber-400">&lt; 2 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal / Card */}
      {submittedTicket ? (
        <div className="p-8 bg-white rounded-3xl border-2 border-emerald-500/40 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Estimation Ticket Submitted
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {submittedTicket.submittedAt}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Ref No: <span className="text-orange-600 font-mono">{submittedTicket.ticketNumber}</span>
              </h3>
              <p className="text-xs text-slate-600">
                Your BOQ and blueprint files have been queued with <strong>{shop.name}</strong>'s sales engineers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Project Name</span>
              <span className="font-bold text-slate-800">{projectName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Uploaded Files</span>
              <span className="font-bold text-slate-800">{submittedTicket.filesCount} Documents / CAD</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Applied Promo Code</span>
              {submittedTicket.promoCode ? (
                <span className="font-black text-emerald-600 flex items-center gap-1 font-mono">
                  <Tag className="w-3 h-3" />
                  {submittedTicket.promoCode} (Verified)
                </span>
              ) : (
                <span className="text-slate-400">None</span>
              )}
            </div>
          </div>

          {appliedPromo && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-black text-emerald-950">
                    Promo Offer Applied: {appliedPromo.title}
                  </p>
                  <p className="text-emerald-700 text-[11px]">{appliedPromo.description}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-black rounded-xl text-[11px] shrink-0">
                {appliedPromo.discountType === 'percentage'
                  ? `${appliedPromo.discountValue}% OFF`
                  : `NPR ${appliedPromo.discountValue} OFF`}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`https://wa.me/9779841234567?text=Namaste%20${encodeURIComponent(
                shop.name
              )},%20I%20have%20submitted%20a%20BOQ%20Estimation%20Ticket%20${
                submittedTicket.ticketNumber
              }%20for%20project%20"${encodeURIComponent(
                projectName
              )}".%20Promo%20Code:%20${submittedTicket.promoCode || 'NONE'}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 transition shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp for Instant Rate Confirmation</span>
            </a>

            <button
              onClick={() => {
                setSubmittedTicket(null);
                setFiles([]);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Upload Another Inquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitInquiry} className="space-y-6">
          {/* ================= 1. DRAG AND DROP FILE UPLOAD AREA ================= */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-orange-500" />
                  <span>Step 1: Upload Documents / Blueprints (कागजात तथा नक्शा अपलोड)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Supports architectural drawings, civil engineering schedules, Excel BOQ, PDF takeoffs, or site photos.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {files.length} {files.length === 1 ? 'file' : 'files'} attached
              </span>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-orange-500 bg-orange-500/5 scale-[1.005]'
                  : 'border-slate-300 hover:border-orange-400 bg-slate-50/70 hover:bg-orange-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.dwg,.dxf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-black text-slate-900">
                Drag & Drop your BOQ spreadsheets or CAD Blueprints here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or <span className="text-orange-600 font-bold underline">browse files from your computer / phone</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[10px] text-slate-500">
                <span className="px-2.5 py-1 bg-white rounded-md border border-slate-200 font-medium">
                  AutoCAD (.DWG, .DXF)
                </span>
                <span className="px-2.5 py-1 bg-white rounded-md border border-slate-200 font-medium">
                  Excel BOQ (.XLSX, .CSV)
                </span>
                <span className="px-2.5 py-1 bg-white rounded-md border border-slate-200 font-medium">
                  PDF Drawings (.PDF)
                </span>
                <span className="px-2.5 py-1 bg-white rounded-md border border-slate-200 font-medium">
                  Site Images (.JPG, .PNG)
                </span>
                <span className="text-slate-400 font-bold">Max 50MB per file</span>
              </div>
            </div>

            {/* Uploaded Files Grid */}
            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700">Attached Project Files:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            getFileIcon(item.type)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {formatFileSize(item.size)} • {item.type.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Remove File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= 2. PROJECT SPECIFICATIONS FORM ================= */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                <span>Step 2: Project Specifications & Site Details</span>
              </h4>
              <p className="text-xs text-slate-500">
                Help {shop.name}'s supply team prepare exact quantity estimations and delivery vehicle logistics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project / Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. 3-Storey Residential House, Baneshwor"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Site Delivery Location (Kathmandu Valley / District) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  placeholder="e.g. Ward 10, New Baneshwor, Kathmandu"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Construction Phase / Material Scope
                </label>
                <select
                  value={constructionPhase}
                  onChange={(e) => setConstructionPhase(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  <option value="Foundation & Pillar Casting">Foundation & Pillar Casting (Cement, Rebar, Sand)</option>
                  <option value="Brick Masonry & Plastering">Brick Masonry & Plastering (OPC/PPC, Sand, Binding Wire)</option>
                  <option value="Plumbing & Sanitaryware">Plumbing & Sanitaryware (CPVC/PPR, Pipes, Fittings, Taps)</option>
                  <option value="Electrical & Wiring">Electrical & Wiring (Wires, MCB, Switches, Conduits)</option>
                  <option value="Paints & Exterior Finishing">Paints & Exterior Finishing (Primer, Emulsion, Putty)</option>
                  <option value="Complete Turnkey Hardware">Complete Turnkey Hardware (Full Bill)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Delivery Timeline
                </label>
                <select
                  value={deliveryUrgency}
                  onChange={(e) => setDeliveryUrgency(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  <option value="Immediate (Within 24 Hours)">Immediate Emergency (Within 24 Hours)</option>
                  <option value="Within 2-3 Days">Within 2-3 Days</option>
                  <option value="Within 1 Week">Within 1 Week</option>
                  <option value="Planning Phase / Budget Estimation">Planning Phase / Budget Estimation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Bikram Shrestha"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Brand Requirements / Notes for Store Manager
              </label>
              <textarea
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Mention preferred brands (Jagdamba, Shivam, Panchakanya, Hama, Astral, Nerolac) or special delivery constraints..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ================= 3. PROMO CODE & CREATOR PARTNER SECTION ================= */}
          <div className="bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-white p-6 rounded-3xl border-2 border-orange-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600" />
                  <span>Step 3: Apply Promo Code or Creator Discount (प्रोमो कोड)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Enter an official partner promo code or social media creator code (e.g. from YouTube, TikTok, or Instagram campaigns).
                </p>
              </div>
              <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-xl text-[10px] font-black uppercase">
                Creator Partner
              </span>
            </div>

            {/* Promo Code Input Field */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter Promo Code (e.g. SISAN10, RONB10, PARAS10, BOQ10)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {appliedPromo ? (
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-red-600 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Remove Code
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApplyPromo()}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Apply Code
                </button>
              )}
            </div>

            {/* Error or Success Message */}
            {promoError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{promoError}</span>
              </div>
            )}

            {appliedPromo && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-black text-emerald-950 font-mono text-sm">
                        {appliedPromo.code}
                      </span>
                      <span className="text-emerald-700 ml-2 font-bold">— {appliedPromo.title}</span>
                      {appliedPromo.isInfluencer && (
                        <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded border border-emerald-300">
                          {appliedPromo.creatorName || 'CREATOR PARTNER'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded-lg">
                    {appliedPromo.discountType === 'percentage'
                      ? `${appliedPromo.discountValue}% OFF`
                      : `NPR ${appliedPromo.discountValue} OFF`}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">{appliedPromo.description}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {appliedPromo.perks.map((perk, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold"
                    >
                      ✓ {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ================= USE POINTS FOR DISCOUNTS IN UPLOAD ================= */}
            <div className="pt-3 border-t border-orange-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-slate-900">
                    Use Points for Quotation Discount (अङ्क प्रयोग गर्नुहोस्)
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded-lg">
                  {userAvailablePoints} Pts Balance (1 Pt = NPR 1)
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: '0 Pts', val: 0, desc: 'None' },
                  { label: '100 Pts', val: 100, desc: '-Rs 100' },
                  { label: '250 Pts', val: 250, desc: '-Rs 250' },
                  { label: '500 Pts', val: 500, desc: '-Rs 500' },
                  { label: 'Max Pts', val: userAvailablePoints, desc: `-Rs ${userAvailablePoints}` },
                ].map((item) => {
                  const isSelected = redeemedPoints === item.val;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectPoints(item.val)}
                      className={`py-2 px-1 rounded-xl text-center transition cursor-pointer border flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs font-black'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="text-[11px] font-bold">{item.label}</span>
                      <span className="text-[9px] opacity-75">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              {redeemedPoints > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    {redeemedPoints} Points Applied to Estimation Bill
                  </span>
                  <span className="font-mono font-black text-amber-800">-NPR {formatNPR(redeemedPoints, 'en')}</span>
                </div>
              )}
            </div>

            {/* IRD 13% VAT Calculation Guarantee */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-950 font-medium">
                  Real-time 13% Nepal VAT is applied to net discounted hardware materials per Inland Revenue Department (IRD) regulations.
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md shrink-0">
                13% VAT Compliant
              </span>
            </div>
          </div>

          {/* ================= SUBMIT BUTTON ================= */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All inquiries are processed under Nepal VAT rules with official IRD registered invoice estimation.
              </span>
            </div>

            <button
              id="submit-boq-estimation-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition cursor-pointer shrink-0"
            >
              {isSubmitting ? (
                <span>Submitting BOQ Documents...</span>
              ) : (
                <>
                  <span>Submit BOQ / Blueprints for Official Quotation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
