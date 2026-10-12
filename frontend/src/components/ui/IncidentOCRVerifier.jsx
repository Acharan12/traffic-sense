import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, XCircle,
  Loader2, Sparkles, Shield, Image as ImageIcon, MapPin,
  RefreshCw, Check, ArrowRight, ShieldCheck, Zap, Navigation,
  X, Trash2
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import MapView from '../map/MapView';
import API from '../../api/client';

export default function IncidentOCRVerifier({ onIncidentVerified, selectedArticle, location = 'Vadodara' }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [toast, setToast] = useState(null);

  const handleRemoveImage = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setImage(null);
    setImagePreview(null);
    setIsOcrProcessing(false);
    setOcrStatus('');
    setOcrProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Automatically load and verify article when selected from News Feed
  useEffect(() => {
    if (selectedArticle) {
      const fullText = `${selectedArticle.title}\n\n${selectedArticle.description || ''}`.trim();
      setOcrText(fullText);
      setImage(null);
      setImagePreview(null);
      handleVerify(fullText);
    }
  }, [selectedArticle]);

  // Quick preset sample news/incident clips for one-click testing
  const PRESET_CLIPS = [
    {
      label: '📍 OCR Route: Karjan → Jambuva',
      title: 'Karjan to Jambuva Corridor',
      text: '+\nQ Karjan Xx\nDestination\nQ Jambuva Housing society x\nGENERATED ROUTE OPTIONS (3) Select card to view path',
      type: 'real',
    },
    {
      label: '🏔️ Himachal Pradesh Crash',
      title: 'Himachal Pradesh Accident',
      text: 'Himachal Pradesh Pilgrim Truck Accident: Over 40 pilgrims from Haryana were injured after a truck they were traveling in fell into a gorge in the Una district. The devotees were headed to the Mata Naina Devi temple when the accident happened.',
      type: 'real',
    },
    {
      label: '📰 Vadodara NH48 Collision',
      title: 'NH48 Vadodara Crash',
      text: 'Major multi-vehicle collision on NH48 Express highway near Vadodara bypass. Two lanes blocked. Police diverted traffic towards Gorwa-Gotri alternate corridor.',
      type: 'real',
    },
    {
      label: '🚨 Fake Viral Hoax Rumor',
      title: 'Vadodara Curfew Audio Rumor Busted',
      text: '🚨 FAKE: WhatsApp Audio Claiming 48-Hour Highway Shutdown in Vadodara Busted\n\nDistrict Magistrate and Police Cyber Cell refuted viral social media rumors claiming total curfew on Chhani Circle as completely fake.',
      type: 'fake',
    },
    {
      label: '🎉 Vadodara Navratri Notice',
      title: 'Vadodara Navratri Notice',
      text: 'Big decision of the police regarding Navratri and Dussehra in Vadodara. Heavy vehicles banned from 11th to 19th October till 2am.\n\nBy: Jignesh Parmar',
      type: 'real',
    },
    {
      label: '⚠️ Viral Unverified Claim',
      title: 'Vadodara-Ahmedabad Accident Claim',
      text: 'A viral message claims that the Vadodara-Ahmedabad Highway has been completely blocked near Nadiad following a massive accident involving 25 vehicles. The message further claims that all vehicles are prohibited from entering the highway for the next 12 hours and that commuters must avoid the route. No official confirmation or verified source is provided for these claims.',
      type: 'unverified',
    },
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    await runTesseractOCR(file);
  };

  const runTesseractOCR = async (file) => {
    setIsOcrProcessing(true);
    setOcrProgress(0);
    setOcrStatus('Initializing OCR engine...');

    try {
      const worker = await createWorker('eng');

      setOcrStatus('Analyzing image & parsing text...');
      const ret = await worker.recognize(file);
      const extractedText = ret.data.text.trim();

      setOcrText(extractedText);
      setOcrProgress(100);
      setOcrStatus('OCR complete!');
      await worker.terminate();

      // Automatically trigger verification on extracted text
      if (extractedText.length > 5) {
        handleVerify(extractedText);
      }
    } catch (err) {
      console.error('OCR Processing error:', err);
      setOcrStatus('OCR failed to read image.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleVerify = async (textToVerify) => {
    const text = textToVerify || ocrText;
    if (!text.trim()) return;

    setVerifying(true);
    setVerificationResult(null);

    const activeCity = selectedArticle?.location || location || 'Vadodara';

    try {
      const res = await API.post(
        '/news/verify',
        {
          text,
          title: text.split('\n')[0].substring(0, 80),
          location: activeCity,
        },
        { timeout: 30000 }
      );

      if (res.data?.success) {
        const data = res.data.data;
        setVerificationResult(data);
        if (data.routes && data.routes.length > 0) {
          setSelectedRouteId(data.routes[0].id);
        }

        // Show toast with proper type (green for verified, red for fake)
        setToast({
          type: data.toastType || (data.isReal ? 'verified' : 'fake'),
          message: data.toastMessage || (data.isReal ? 'Fact-check analysis complete.' : 'Hoax report flagged.'),
        });
        setTimeout(() => setToast(null), 5000);

        if (data.isReal && onIncidentVerified) {
          onIncidentVerified(data);
        }
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setToast({
        type: 'fake',
        message: 'Could not connect to verification service.',
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setVerifying(false);
    }
  };

  const loadPreset = (preset) => {
    setOcrText(preset.text);
    setImagePreview(null);
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    handleVerify(preset.text);
  };

  const openInRoutePlanner = () => {
    if (verificationResult?.source && verificationResult?.destination) {
      navigate('/route-planner', {
        state: {
          source: verificationResult.source,
          destination: verificationResult.destination,
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between shadow-lg animate-fade-in ${
            toast.type === 'verified'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'verified' ? (
              <CheckCircle2 size={16} />
            ) : toast.type === 'warning' ? (
              <AlertTriangle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-notion-border pb-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-purple-500" />
          <div>
            <h3 className="text-sm font-bold text-notion-heading font-serif">
              Incident Fact-Checker & OCR Image Analyzer
            </h3>
            <p className="text-[11px] text-notion-dim">
              Upload road notices, news clippings or social posts to classify Real vs. Fake & map real road corridors.
            </p>
          </div>
        </div>
        <span className="notion-pill notion-pill-blue text-[10px]">Tesseract.js + OSRM</span>
      </div>

      {/* Preset Quick Test Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-notion-dim mr-1">Quick Sample Presets:</span>
        {PRESET_CLIPS.map((p, i) => (
          <button
            key={i}
            onClick={() => loadPreset(p)}
            className="btn-notion-secondary text-[11px] py-1 px-2.5"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Upload and OCR Section */}
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Left Box: Image Upload & OCR Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-notion-heading block">
              1. Upload Incident Image / Notice (OCR)
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-[11px] text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 hover:underline transition-colors cursor-pointer"
                title="Remove uploaded image"
              >
                <Trash2 size={11} />
                <span>Remove image</span>
              </button>
            )}
          </div>
          <div className="border-2 border-dashed border-notion-border hover:border-notion-subtle rounded p-4 text-center cursor-pointer bg-notion-sidebar transition-colors relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            {imagePreview ? (
              <div className="space-y-2 relative">
                <div className="relative inline-block mx-auto">
                  <img
                    src={imagePreview}
                    alt="Uploaded clip"
                    className="max-h-36 mx-auto rounded object-contain border border-notion-border shadow-xs"
                  />
                  {/* Small floating remove button on image corner */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px]">
                  <span className="text-notion-dim">Click or drop new image to replace</span>
                  <span className="text-notion-dim">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium z-20 relative cursor-pointer hover:underline flex items-center gap-1"
                  >
                    <X size={11} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <Upload size={24} className="mx-auto text-notion-dim" />
                <p className="text-xs text-notion-heading font-medium">
                  Drop incident photo, route screenshot or newspaper clipping
                </p>
                <p className="text-[10px] text-notion-dim">Supports PNG, JPG, JPEG, WebP</p>
              </div>
            )}
          </div>

          {isOcrProcessing && (
            <div className="p-3 rounded bg-notion-sidebar border border-notion-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-notion-heading">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-purple-500" />
                  {ocrStatus}
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400">{ocrProgress}%</span>
              </div>
              <div className="w-full h-1 bg-notion-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Box: Extracted / Typed Text Editor */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-notion-heading block">
            2. Extracted Incident Text & Details
          </label>
          <textarea
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            placeholder="Extracted text from OCR will appear here. Or type/paste any road report, route text or news headline..."
            rows={5}
            className="notion-input text-xs font-mono resize-none h-36"
          />

          <button
            onClick={() => handleVerify(ocrText)}
            disabled={verifying || !ocrText.trim()}
            className="btn-notion-primary w-full justify-center py-2 text-xs font-semibold"
          >
            {verifying ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Running AI Credibility & Fact-Check Analysis...
              </>
            ) : (
              <>
                <ShieldCheck size={14} /> Fact-Check & Classify Report (Real vs Fake)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Output Result Display */}
      {verificationResult && (
        <div className="pt-4 border-t border-notion-border space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-notion-dim uppercase tracking-wider">
              Verification Verdict & Spatial Analysis
            </span>
            <span
              className={`notion-pill font-bold text-xs uppercase ${
                verificationResult.isReal
                  ? 'notion-pill-green'
                  : verificationResult.verdict === 'UNVERIFIED_RUMOR'
                  ? 'notion-pill-yellow'
                  : 'notion-pill-red'
              }`}
            >
              {verificationResult.isReal
                ? '● VERIFIED REAL INCIDENT'
                : verificationResult.verdict === 'UNVERIFIED_RUMOR'
                ? '⚠️ UNVERIFIED VIRAL CLAIM'
                : '● FAKE / HOAX REPORT'}
            </span>
          </div>

          {/* If Fake or Unverified */}
          {!verificationResult.isReal ? (
            <div
              className={`${
                verificationResult.verdict === 'UNVERIFIED_RUMOR'
                  ? 'p-3 rounded-md border text-xs bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'notion-callout-red'
              } space-y-2`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {verificationResult.verdict === 'UNVERIFIED_RUMOR' ? (
                  <>
                    <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                    <span>Unverified Viral Claim / Social Media Rumor</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-red-500 flex-shrink-0" />
                    <span>Hoax / Debunked News Alert</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {verificationResult.explanation}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] opacity-75">Credibility Score:</span>
                <span className="font-mono font-bold text-xs">
                  {verificationResult.credibilityScore} / 100
                </span>
                <span className="notion-pill notion-pill-gray text-[10px] ml-auto">
                  Excluded from live navigation map
                </span>
              </div>
            </div>
          ) : (
            /* If Real */
            <div className="space-y-4">
              {/* Success Callout */}
              <div className="notion-callout-green space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>Legitimate Incident Confirmed ({verificationResult.credibilityScore}% Confidence)</span>
                  </div>
                  <span className="notion-pill notion-pill-yellow text-[10px] capitalize">
                    {verificationResult.incidentType} · {verificationResult.severity} severity
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {verificationResult.explanation}
                </p>
              </div>

              {/* Spatial Map: Real Route Geometry, Traffic Impact Area & Safe Detour Zones */}
              <div className="notion-card overflow-hidden">
                <div className="p-3 border-b border-notion-border flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-notion-heading flex items-center gap-1.5">
                      <MapPin size={13} className="text-blue-500" />
                      Spatial Traffic & Safe Detour Map ({verificationResult.location})
                    </span>
                    <span className="notion-pill notion-pill-red text-[10px]">
                      🔴 Congested Impact Area
                    </span>
                    <span className="notion-pill notion-pill-green text-[10px]">
                      🟢 Safe Alternate Bypass
                    </span>
                  </div>

                  {verificationResult.source && verificationResult.destination && (
                    <button
                      onClick={openInRoutePlanner}
                      className="btn-notion-primary text-xs py-1 px-2.5 flex items-center gap-1 font-semibold"
                    >
                      <Navigation size={12} />
                      <span>Open in Route Planner</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>

                <div className="h-[400px] w-full">
                  <MapView
                    center={
                      verificationResult.trafficZone?.center || [
                        verificationResult.coordinates?.latitude || 22.3072,
                        verificationResult.coordinates?.longitude || 73.1812,
                      ]
                    }
                    zoom={13}
                    source={verificationResult.source}
                    destination={verificationResult.destination}
                    routes={verificationResult.routes || []}
                    selectedRoute={selectedRouteId}
                    onSelectRoute={setSelectedRouteId}
                    trafficZones={verificationResult.trafficZone ? [verificationResult.trafficZone] : []}
                    safeZones={verificationResult.safeZones || []}
                    height="100%"
                  />
                </div>

                {/* Legend & Details */}
                <div className="p-3 bg-notion-sidebar border-t border-notion-border grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      🚨 {verificationResult.trafficZone?.name}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {verificationResult.trafficZone?.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      🛡️ Recommended Safe Alternate Route
                    </p>
                    <p className="text-[11px] opacity-80">
                      {verificationResult.safeZones?.[0]?.name} — {verificationResult.safeZones?.[0]?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
