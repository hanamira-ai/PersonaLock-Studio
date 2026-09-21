import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AspectRatio,
  LightingStyle,
  CameraPerspective,
  Gender,
  AgeRange,
  BodyShape,
  PoseMode,
  ModelConfig,
  UploadedImage,
  GenerationResult,
  HistoryItem
} from './types';
import { generateModelImage } from './geminiService';
import { Logo } from './Logo';

const App: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [config, setConfig] = useState<ModelConfig>({
    aspectRatio: '1:1',
    lighting: 'Studio Softbox',
    perspective: 'Eye Level',
    gender: 'Female',
    ageRange: 'Adults',
    bodyShape: 'Standard',
    poseMode: 'Natural Pose'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(
    'different person, altered identity, changed facial structure, distorted face, deformed face, mutated face, asymmetrical face, inaccurate facial features, altered eyes, altered nose, altered lips, altered jawline, exaggerated facial proportions, stretched face, compressed face.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegativePrompt, setCopiedNegativePrompt] = useState(false);

  const handleCopyPrompt = () => {
    if (!generatedPrompt) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedPrompt);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = generatedPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyNegativePrompt = () => {
    if (!negativePrompt) return;
    const textToCopy = `[Negative Prompt] : ${negativePrompt}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedNegativePrompt(true);
    setTimeout(() => setCopiedNegativePrompt(false), 2000);
  };

  // Auto-generate prompt when config changes
  useEffect(() => {
    const poseClause = config.poseMode === 'Front-Facing ID Photo'
      ? 'front-facing ID photo, facing forward, eye-level camera, straight-on angle, centered symmetrical composition. '
      : '';

    const prompt = `A professional editorial photography of a ${config.ageRange.toLowerCase()} ${config.gender.toLowerCase()} model with ${config.bodyShape.toLowerCase()} body type. The model should have the exact facial features from the reference images. ${poseClause}Camera positioned at ${config.perspective}, captured with ${config.lighting} lighting. The model is posing naturally. The most important detail: THE BACKGROUND IS PURE WHITE, clean and minimalist studio setting. Highly detailed, photorealistic, 8k.`;
    setGeneratedPrompt(prompt);
  }, [config]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            base64,
            mimeType: file.type
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError("Please upload at least one reference photo.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { imageUrl } = await generateModelImage(images, config, generatedPrompt, negativePrompt);
      const newResult = { imageUrl, prompt: generatedPrompt };
      setResult(newResult);

      // Add to history
      const historyItem: HistoryItem = {
        ...newResult,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectFromHistory = (item: HistoryItem) => {
    setResult({ imageUrl: item.imageUrl, prompt: item.prompt });
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Sidebar: Controls & Uploads */}
      <aside className="w-full lg:w-[450px] bg-white border-r border-zinc-200 overflow-y-auto p-6 flex flex-col gap-8 shadow-xl z-10">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center shadow-md flex-shrink-0">
              <Logo className="w-9 h-9" dark={true} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">PersonaLock Studio</h1>
              <p className="text-[11px] text-zinc-400 font-medium tracking-wide">Mizumoto CS • Identity-Locked</p>
            </div>
          </div>
          <p className="text-zinc-500 text-sm">Professional Model Extraction & Synthesis</p>
        </header>

        {/* Reference Upload Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-zinc-800">Reference Photos</h3>
            <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">{images.length} Loaded</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {images.map(img => (
              <div key={img.id} className="relative aspect-square group">
                <img src={img.url} className="w-full h-full object-cover rounded-lg border border-zinc-200" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
              <i className="fa-solid fa-plus text-zinc-300 mb-1"></i>
              <span className="text-[8px] text-zinc-400 font-medium text-center px-1">Add Photo</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </section>

        {/* Parameter Configuration */}
        <section className="space-y-4">
          <h3 className="font-semibold text-zinc-800 border-b border-zinc-100 pb-2">Synthesis Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Gender</label>
              <select
                value={config.gender}
                onChange={(e) => setConfig({ ...config, gender: e.target.value as Gender })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Age Range</label>
              <select
                value={config.ageRange}
                onChange={(e) => setConfig({ ...config, ageRange: e.target.value as AgeRange })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option>Children</option>
                <option>Teenagers</option>
                <option>Adults</option>
                <option>Elderly</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Body Shape</label>
            <select
              value={config.bodyShape}
              onChange={(e) => setConfig({ ...config, bodyShape: e.target.value as BodyShape })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option>Standard</option>
              <option>Slim</option>
              <option>Athletic</option>
              <option>Curvy</option>
              <option>Muscular</option>
              <option>Plus Size</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Lighting Style</label>
            <select
              value={config.lighting}
              onChange={(e) => setConfig({ ...config, lighting: e.target.value as LightingStyle })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option>Studio Softbox</option>
              <option>High-Key Cinematic</option>
              <option>Dramatic Rim Light</option>
              <option>Natural Sunlight</option>
              <option>Neon Cyberpunk</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Perspective</label>
            <select
              value={config.perspective}
              onChange={(e) => setConfig({ ...config, perspective: e.target.value as CameraPerspective })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option>Eye Level</option>
              <option>Low Angle</option>
              <option>Close-Up Portrait</option>
              <option>Full Body Shot</option>
              <option>Over-the-shoulder</option>
            </select>
          </div>

          {/* BARU: Pose / Framing */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pose / Framing</label>
            <select
              value={config.poseMode}
              onChange={(e) => setConfig({ ...config, poseMode: e.target.value as PoseMode })}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option>Natural Pose</option>
              <option>Front-Facing ID Photo</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {(['1:1', '3:4', '4:3', '9:16', '16:9'] as AspectRatio[]).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setConfig({ ...config, aspectRatio: ratio })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    config.aspectRatio === ratio
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* History Section */}
        {history.length > 0 && (
          <section className="space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <h3 className="font-semibold text-zinc-800">Recent Generations</h3>
              <button
                onClick={() => setHistory([])}
                className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest font-bold"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => selectFromHistory(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                    result?.imageUrl === item.imageUrl ? 'border-yellow-400 shadow-md' : 'border-transparent hover:border-zinc-300'
                  }`}
                >
                  <img src={item.imageUrl} className="w-full h-full object-cover" alt="History generation" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Command Box */}
        <section className="space-y-2 mt-auto pt-4 border-t border-zinc-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">PersonaLock Commands</label>
            <button
              onClick={handleCopyPrompt}
              className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-zinc-100 cursor-pointer"
              title="Copy prompt"
            >
              <i className={`fa-regular ${copiedPrompt ? 'fa-circle-check text-green-600' : 'fa-copy'}`}></i>
              <span className={copiedPrompt ? 'text-green-600 font-medium' : ''}>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
            </button>
          </div>
          <textarea
            className="w-full h-24 bg-zinc-900 text-zinc-400 text-[11px] font-mono p-3 rounded-lg resize-none leading-relaxed border border-zinc-800 focus:border-yellow-400 outline-none transition-colors"
            value={generatedPrompt}
            onChange={(e) => setGeneratedPrompt(e.target.value)}
          />

          {/* BARU: Negative Prompt */}
          <div className="flex justify-between items-center pt-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Negative Prompt</label>
            <button
              onClick={handleCopyNegativePrompt}
              className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-zinc-100 cursor-pointer"
              title="Copy negative prompt"
            >
              <i className={`fa-regular ${copiedNegativePrompt ? 'fa-circle-check text-green-600' : 'fa-copy'}`}></i>
              <span className={copiedNegativePrompt ? 'text-green-600 font-medium' : ''}>{copiedNegativePrompt ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            className="w-full h-20 bg-zinc-900 text-zinc-400 text-[11px] font-mono p-3 rounded-lg resize-none leading-relaxed border border-zinc-800 focus:border-yellow-400 outline-none transition-colors"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />

          <button
            disabled={loading || images.length === 0}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              loading || images.length === 0
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Synthesizing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i>
                Generate Image
              </>
            )}
          </button>
          {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
        </section>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 bg-zinc-100 p-8 flex items-center justify-center relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-200 rounded-full blur-3xl"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-6 animate-pulse z-20">
            <div className="w-24 h-24 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-zinc-800">Processing Character Matrix</h2>
              <p className="text-zinc-500">Extracting facial landmarks and synthesizing studio environment...</p>
            </div>
          </div>
        ) : result ? (
          <div className="max-w-4xl w-full flex flex-col gap-6 z-20 animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-4 rounded-3xl shadow-2xl relative group flex justify-center">
              <img
                src={result.imageUrl}
                alt="Generated Model"
                className="max-h-[70vh] w-auto rounded-2xl shadow-inner border border-zinc-100 object-contain"
              />
              <div className="absolute top-8 right-8 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={result.imageUrl}
                  download="generated-model.png"
                  className="bg-white/90 backdrop-blur-md p-3 rounded-full text-zinc-800 hover:bg-yellow-400 transition-colors shadow-lg flex items-center justify-center"
                  title="Download Image"
                >
                  <i className="fa-solid fa-download"></i>
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between px-4">
              <div>
                <h4 className="font-bold text-zinc-800">Studio Output</h4>
                <p className="text-zinc-500 text-sm">Generated with PersonaLock Studio 2.5 • Pure White Background</p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-medium flex items-center gap-2"
              >
                <i className="fa-solid fa-rotate-left"></i>
                Start New Synthesis
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-md z-20">
            <div className="bg-white w-20 h-20 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-image text-zinc-200 text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-2">Ready to Synthesize</h2>
            <p className="text-zinc-500">Upload your reference photos and configure your model parameters to begin the generation process.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50">
                <i className="fa-solid fa-id-card text-yellow-500 mb-1"></i>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Face Extraction</p>
                <p className="text-xs text-zinc-600">Preserves distinct character facial traits</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50">
                <i className="fa-solid fa-palette text-blue-500 mb-1"></i>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Studio Lighting</p>
                <p className="text-xs text-zinc-600">Pro-grade illumination and shading</p>
              </div>
            </div>
          </div>
        )}

        {/* Branding Overlay */}
        <div className="absolute bottom-8 right-8 text-zinc-300 font-bold tracking-[0.2em] text-sm hidden lg:block uppercase pointer-events-none">
          PersonaLock Synthesis Engine v2.5
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f4f4f5;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  );
};

export default App;
