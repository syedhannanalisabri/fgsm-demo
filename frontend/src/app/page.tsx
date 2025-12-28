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

  const apiBase = "https://fgsm-backend-syedh-01.azurewebsites.net";

  const cleanPreviewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  async function runAttack() {
    setError(null);
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

  const advPreviewUrl = resp?.adversarial_image_base64
    ? `data:image/png;base64,${resp.adversarial_image_base64}`
    : null;

  return (
    <main style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logoBadge}>⚡</div>
          <div>
            <h1 style={styles.title}>FGSM ADVERSARIAL LAB</h1>
            <p style={styles.subtitle}>Explore Fast Gradient Sign Method attacks on neural networks</p>
          </div>
        </header>

        <div style={styles.mainGrid}>
          {/* Controls Panel */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>CONFIGURATION</h2>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>1. Source Image</label>
              <div style={styles.uploadBox}>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={styles.fileInput}
                />
                <div style={{ textAlign: "center", color: "#94a3b8" }}>
                  {file ? file.name : "Click to select or drag image"}
                </div>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>2. Perturbation (ε)</label>
                <span style={styles.epsilonValue}>{epsilon.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <button
              onClick={runAttack}
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: loading ? "#334155" : "#3b82f6",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "EXECUTING ATTACK..." : "RUN ANALYSIS"}
            </button>

            {error && <div style={styles.errorBox}>⚠ {error}</div>}
          </section>

          {/* Results Area */}
          <section style={{ ...styles.card, flex: 2 }}>
            <h2 style={styles.cardTitle}>NEURAL RESPONSE</h2>
            {!resp && !loading ? (
              <div style={styles.emptyState}>Initialize an attack to see model results</div>
            ) : (
              <div style={{ opacity: loading ? 0.5 : 1, transition: "0.3s opacity" }}>
                <div style={styles.resultsHeader}>
                  <div style={styles.stat}>
                    <span style={styles.statLabel}>Clean Pred</span>
                    <span style={styles.statValue}>{resp?.clean_prediction ?? "?"}</span>
                  </div>
                  <div style={styles.stat}>
                    <span style={{...styles.statLabel, color: "#f87171"}}>Adv Pred</span>
                    <span style={{...styles.statValue, color: "#f87171"}}>{resp?.adversarial_prediction ?? "?"}</span>
                  </div>
                  {resp?.attack_success && (
                    <div style={styles.successBadge}>SUCCESSFUL BREACH</div>
                  )}
                </div>

                <div style={styles.imageGrid}>
                  <div style={styles.imageContainer}>
                    <p style={styles.imageLabel}>ORIGINAL INPUT</p>
                    <div style={styles.imageWrapper}>
                      {cleanPreviewUrl ? (
                        <img src={cleanPreviewUrl} alt="Clean" style={styles.img} />
                      ) : (
                        <div style={styles.imagePlaceholder} />
                      )}
                    </div>
                  </div>

                  <div style={styles.imageContainer}>
                    <p style={{...styles.imageLabel, color: "#60a5fa"}}>ADVERSARIAL OUTPUT</p>
                    <div style={{...styles.imageWrapper, borderColor: "#3b82f666"}}>
                      {advPreviewUrl ? (
                        <img src={advPreviewUrl} alt="Adversarial" style={styles.img} />
                      ) : (
                        <div style={styles.imagePlaceholder} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "40px 20px",
  },
  wrapper: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
  },
  logoBadge: {
    width: "50px",
    height: "50px",
    backgroundColor: "#3b82f6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
  },
  title: {
    fontSize: "28px",
    fontWeight: 900,
    letterSpacing: "-0.5px",
    margin: 0,
  },
  subtitle: {
    color: "#94a3b8",
    margin: "4px 0 0 0",
    fontSize: "15px",
  },
  mainGrid: {
    display: "flex",
    flexDirection: "row",
    gap: "24px",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "24px",
    flex: 1,
    minWidth: "320px",
    backdropFilter: "blur(10px)",
  },
  cardTitle: {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.5px",
    color: "#3b82f6",
    marginBottom: "24px",
    borderBottom: "1px solid #334155",
    paddingBottom: "10px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#cbd5e1",
    display: "block",
    marginBottom: "8px",
  },
  uploadBox: {
    border: "2px dashed #475569",
    borderRadius: "12px",
    padding: "20px",
    position: "relative",
    cursor: "pointer",
    transition: "0.2s border-color",
  },
  fileInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "pointer",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  epsilonValue: {
    fontFamily: "monospace",
    backgroundColor: "#1e293b",
    padding: "2px 8px",
    borderRadius: "4px",
    color: "#60a5fa",
  },
  slider: {
    width: "100%",
    marginTop: "10px",
    cursor: "pointer",
  },
  button: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    color: "white",
    fontWeight: 700,
    fontSize: "14px",
    transition: "0.2s transform active",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  errorBox: {
    marginTop: "16px",
    color: "#f87171",
    fontSize: "13px",
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(248, 113, 113, 0.2)",
  },
  emptyState: {
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontStyle: "italic",
    textAlign: "center",
  },
  resultsHeader: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 800,
    fontFamily: "monospace",
  },
  successBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    color: "#4ade80",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    border: "1px solid rgba(34, 197, 94, 0.2)",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  imageContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  imageLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
  },
  imageWrapper: {
    backgroundColor: "#020617",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #334155",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    imageRendering: "pixelated",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0f172a",
  },
};
