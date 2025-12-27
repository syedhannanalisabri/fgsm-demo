"use client";

import { useMemo, useState } from "react";

type AttackResponse = {
  clean_prediction: number;
  adversarial_prediction: number;
  attack_success: boolean;
  epsilon: number;
  adversarial_image_base64: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [epsilon, setEpsilon] = useState<number>(0.1);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AttackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const cleanPreviewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  async function runAttack() {
    setError(null);
    setResp(null);

    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("epsilon", String(epsilon));

      const res = await fetch(`${apiBase}/attack`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error (${res.status}): ${text}`);
      }

      const data = (await res.json()) as AttackResponse;
      setResp(data);
    } catch (e: any) {
      setError(e?.message || "Unknown error while calling the API.");
    } finally {
      setLoading(false);
    }
  }

  const advPreviewUrl =
    resp?.adversarial_image_base64
      ? `data:image/png;base64,${resp.adversarial_image_base64}`
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(45deg, #a855f7, #ec4899, #8b5cf6, #a855f7);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-border:hover::before {
          opacity: 1;
        }
        .animated-bg {
          background: linear-gradient(270deg, #a855f7, #ec4899, #8b5cf6);
          background-size: 600% 600%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>

      <main className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4 animate-pulse">
            FGSM Attack Lab
          </h1>
          <p className="text-xl text-purple-200">
            Unleash adversarial perturbations and fool neural networks
          </p>
        </div>

        <div className="glass rounded-3xl p-8 mb-8 glow-border">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-semibold text-purple-200 mb-3">
                🖼️ Upload Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-purple-200 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:scale-105 file:transition-transform file:cursor-pointer cursor-pointer"
                />
              </div>
              <p className="text-purple-300 text-sm mt-3">
                💡 Clear handwritten digits work best
              </p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-purple-200 mb-3">
                ⚡ Epsilon: {epsilon.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
                className="w-full h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex gap-4 items-center mt-4">
                <input
                  type="number"
                  min="0"
                  max="0.4"
                  step="0.01"
                  value={epsilon}
                  onChange={(e) => setEpsilon(Number(e.target.value))}
                  className="w-32 px-4 py-2 bg-purple-900/50 border border-purple-500/30 rounded-lg text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-purple-300 text-sm">Range: 0.00 – 0.40</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={runAttack}
              disabled={loading}
              className={`relative px-10 py-4 rounded-full text-white font-bold text-lg overflow-hidden transition-all ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "animated-bg hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
              }`}
            >
              <span className="relative z-10">
                {loading ? "🔄 Attacking..." : "🚀 Launch Attack"}
              </span>
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-center font-semibold">
              ⚠️ {error}
            </div>
          )}
        </div>

        {resp && (
          <div className="glass rounded-3xl p-8 glow-border animate-fade-in">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6">
              ✨ Attack Results
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="glass rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">Clean Prediction:</span>
                  <span className="text-2xl font-bold text-green-400">{resp.clean_prediction}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">Adversarial Prediction:</span>
                  <span className="text-2xl font-bold text-orange-400">{resp.adversarial_prediction}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">Attack Success:</span>
                  <span className={`text-xl font-bold ${resp.attack_success ? 'text-red-400' : 'text-gray-400'}`}>
                    {resp.attack_success ? '✅ YES' : '❌ NO'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">Epsilon Used:</span>
                  <span className="text-xl font-bold text-purple-400">{resp.epsilon}</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="text-purple-200 font-semibold mb-2">🔗 Backend</div>
                <div className="text-purple-300 text-sm break-all">{apiBase}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-200 mb-4">🎯 Original Image</div>
                {cleanPreviewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={cleanPreviewUrl}
                      alt="Original"
                      className="w-64 h-64 object-contain border-4 border-purple-500 rounded-2xl shadow-2xl hover:scale-105 transition-transform"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                ) : (
                  <div className="text-purple-300">No image</div>
                )}
              </div>

              <div className="text-center">
                <div className="text-xl font-bold text-pink-400 mb-4">⚔️ Adversarial Image</div>
                {advPreviewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={advPreviewUrl}
                      alt="Adversarial"
                      className="w-64 h-64 object-contain border-4 border-pink-500 rounded-2xl shadow-2xl hover:scale-105 transition-transform"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                ) : (
                  <div className="text-purple-300">No adversarial image</div>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="text-center mt-12 text-purple-300 text-sm">
          💫 FGSM success depends on input image and epsilon value. Experiment with different settings for optimal results.
        </footer>
      </main>
    </div>
  );
}
