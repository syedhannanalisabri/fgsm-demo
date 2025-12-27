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
    <main
  style={{
    maxWidth: 980,
    margin: "40px auto",
    padding: "24px",
    fontFamily: "system-ui",
    background: "#ffffffff",
    color: "#111827",
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  }}
>

      <h1 style={{ marginBottom: 6 }}>FGSM Adversarial Attack Demo</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Upload a digit image, set epsilon, and compare the model’s clean vs adversarial predictions.
      </p>

      <section style={{ border: "1px solid #919191ff", borderRadius: 10, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontWeight: 600 }}>Upload image (PNG/JPEG)</label>
            <div style={{ marginTop: 8 }}>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <p style={{ color: "#666", marginTop: 10, fontSize: 13 }}>
              Tip: a clear handwritten digit on white background usually works best.
            </p>
          </div>

          <div>
            <label style={{ fontWeight: 600 }}>Epsilon: {epsilon.toFixed(2)}</label>
            <div style={{ marginTop: 8 }}>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                min="0"
                max="0.4"
                step="0.01"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
                style={{ width: 110, padding: 6 }}
              />
              <span style={{ color: "#666", fontSize: 13 }}>(0.00 – 0.40)</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
  onClick={runAttack}
  disabled={loading}
  style={{
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: loading ? "#9ca3af" : "#2563eb",
    color: "#ffffff",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
  }}
>

            {loading ? "Running attack..." : "Run FGSM Attack"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 12, color: "crimson", fontWeight: 600 }}>
            {error}
          </div>
        )}
      </section>

      {resp && (
        <section
  style={{
    marginTop: 24,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    background: "#ffffff",
  }}
>

          <h2 style={{ marginTop: 0 }}>Results</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div><b>Clean prediction:</b> {resp.clean_prediction}</div>
              <div><b>Adversarial prediction:</b> {resp.adversarial_prediction}</div>
              <div><b>Attack success:</b> {String(resp.attack_success)}</div>
              <div><b>Epsilon:</b> {resp.epsilon}</div>
            </div>

            <div style={{ color: "#444" }}>
              <b>Backend:</b> {apiBase}
              <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                If you deploy later, update <code>.env.local</code> (or Amplify env vars) to point to the deployed API.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Original</div>
              {cleanPreviewUrl ? (
                <img
                  src={cleanPreviewUrl}
                  alt="Original"
                  width={240}
                  height={240}
                  style={{ border: "1px solid #ccc", borderRadius: 8, imageRendering: "pixelated" }}
                />
              ) : (
                <div style={{ color: "#666" }}>No image</div>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Adversarial</div>
              {advPreviewUrl ? (
                <img
                  src={advPreviewUrl}
                  alt="Adversarial"
                  width={240}
                  height={240}
                  style={{ border: "1px solid #ccc", borderRadius: 8, imageRendering: "pixelated" }}
                />
              ) : (
                <div style={{ color: "#666" }}>No adversarial image returned</div>
              )}
            </div>
          </div>
        </section>
      )}

      <footer style={{ marginTop: 20, color: "#777", fontSize: 12 }}>
        Note: FGSM success depends on the input and epsilon. Some images may require a higher epsilon to flip the prediction.
      </footer>
    </main>
  );
}
