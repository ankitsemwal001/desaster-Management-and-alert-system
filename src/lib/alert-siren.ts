// Web-Audio emergency siren — no asset files required.

let ctx: AudioContext | null = null;
let osc: OscillatorNode | null = null;
let gain: GainNode | null = null;
let lfo: OscillatorNode | null = null;

function ensure(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

export function playSiren(durationMs = 6000, severity: "high" | "extreme" = "extreme") {
  if (typeof window === "undefined") return;
  stopSiren();
  const a = ensure();
  osc = a.createOscillator();
  gain = a.createGain();
  lfo = a.createOscillator();
  const lfoGain = a.createGain();

  osc.type = "sawtooth";
  osc.frequency.value = severity === "extreme" ? 720 : 540;
  lfo.type = "sine";
  lfo.frequency.value = severity === "extreme" ? 4 : 2.5;
  lfoGain.gain.value = severity === "extreme" ? 280 : 160;

  lfo.connect(lfoGain).connect(osc.frequency);
  gain.gain.value = 0.0001;
  gain.gain.exponentialRampToValueAtTime(0.25, a.currentTime + 0.05);

  osc.connect(gain).connect(a.destination);
  osc.start();
  lfo.start();

  setTimeout(stopSiren, durationMs);
}

export function stopSiren() {
  try {
    const a = ctx;
    if (gain && a) gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.15);
    setTimeout(() => {
      try { osc?.stop(); lfo?.stop(); } catch { /* noop */ }
      osc = null; lfo = null; gain = null;
    }, 200);
  } catch { /* noop */ }
}

export function beep() {
  if (typeof window === "undefined") return;
  const a = ensure();
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "square"; o.frequency.value = 880;
  g.gain.value = 0.0001;
  g.gain.exponentialRampToValueAtTime(0.2, a.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.18);
  o.connect(g).connect(a.destination);
  o.start(); o.stop(a.currentTime + 0.2);
}
