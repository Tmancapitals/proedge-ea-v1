import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, Play, ShieldCheck, Trash2 } from "lucide-react";
import { type CSSProperties, type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import robotArtwork from "@/assets/capital-vault-robot.jpg.asset.json";
import { activateLicense } from "@/lib/licenses.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Capital Vault V1.0 — Secure Trading Access" },
      { name: "description", content: "Securely activate Capital Vault and continue to your MetaTrader 5 trading account." },
      { property: "og:title", content: "Capital Vault V1.0" },
      { property: "og:description", content: "Secure Capital Vault license activation and MT5 access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Screen = "identity" | "license" | "broker" | "dashboard";

function Index() {
  const activate = useServerFn(activateLicense);
  const [screen, setScreen] = useState<Screen>("identity");
  const [mentorId, setMentorId] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [broker, setBroker] = useState("");
  const [server, setServer] = useState("");
  const [login, setLogin] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const existing = window.localStorage.getItem("capital-vault-device");
    if (existing) {
      setDeviceId(existing);
      return;
    }
    const next = crypto.randomUUID();
    window.localStorage.setItem("capital-vault-device", next);
    setDeviceId(next);
  }, []);

  function continueIdentity(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!mentorId.trim() || !email.includes("@")) {
      setMessage("Enter a valid Mentor ID and email address.");
      return;
    }
    setScreen("license");
  }

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await activate({ data: { mentorId, email, license, deviceId } });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setScreen("broker");
    } catch {
      setMessage("Activation could not be completed. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  function connectBroker(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!broker || !server || !login.trim()) {
      setMessage("Choose your broker and server, then enter your MT5 login.");
      return;
    }
    setScreen("dashboard");
  }

  const brokers = ["JustMarkets", "HFM", "RCG Markets", "Razor Markets"];

  return (
    <main className="vault-shell min-h-screen overflow-hidden bg-background text-foreground" style={{ "--robot-art": `url(${robotArtwork.url})` } as CSSProperties}>
      <div className="vault-grid mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-5">
        <header className="mx-auto rounded-full border-2 border-primary bg-panel/80 px-9 py-2 text-center shadow-vault backdrop-blur-md">
          <h1 className="text-xl font-semibold">CAPITAL VAULT V1.0</h1>
        </header>

        <section className="flex flex-1 flex-col">
          <div className="robot-portrait mx-auto mt-8 flex aspect-square w-[72%] max-w-72 items-center justify-center overflow-hidden rounded-full border-[3px] border-primary bg-panel/85 shadow-vault">
            <img src={robotArtwork.url} alt="Capital Vault robot" className="h-full w-full object-cover object-top" />
          </div>
          <p className="mt-7 text-center text-base text-muted-foreground">~ Tman Capital</p>

          {screen !== "dashboard" ? (
            <div className="mx-auto mt-6 w-full max-w-sm rounded-lg border border-border bg-panel/75 p-4 shadow-panel backdrop-blur-md">
              {screen === "identity" && (
                <form className="space-y-3" onSubmit={continueIdentity}>
                  <label className="field-label">Mentor ID<input value={mentorId} onChange={(e) => setMentorId(e.target.value)} placeholder="Enter Mentor ID" autoComplete="off" /></label>
                  <label className="field-label">Buyer email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></label>
                  <Button variant="action" className="mt-2 h-12 w-full">Proceed</Button>
                </form>
              )}

              {screen === "license" && (
                <form className="space-y-3" onSubmit={unlock}>
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 text-primary" /> Secure device activation</div>
                  <label className="field-label">License key<input value={license} onChange={(e) => setLicense(e.target.value.toUpperCase())} placeholder="TV-XXXX" autoCapitalize="characters" autoComplete="off" /></label>
                  <Button variant="action" className="h-12 w-full" disabled={busy || !deviceId}>{busy ? "Checking…" : "Unlock"}</Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setScreen("identity")}>Back</Button>
                </form>
              )}

              {screen === "broker" && (
                <form className="space-y-3" onSubmit={connectBroker}>
                  <label className="field-label">Broker<select value={broker} onChange={(e) => { setBroker(e.target.value); setServer(""); }}><option value="">Select broker</option>{brokers.map((name) => <option key={name}>{name}</option>)}</select></label>
                  <label className="field-label">Server<select value={server} onChange={(e) => setServer(e.target.value)} disabled={!broker}><option value="">Select server</option>{broker && <><option>{broker}-Live</option><option>{broker}-Demo</option></>}</select></label>
                  <label className="field-label">MT5 login<input value={login} onChange={(e) => setLogin(e.target.value)} inputMode="numeric" placeholder="Account number" autoComplete="off" /></label>
                  <p className="text-xs leading-relaxed text-muted-foreground">For your safety, this app never asks for or stores your MT5 password.</p>
                  <Button variant="action" className="h-12 w-full">Continue to dashboard</Button>
                </form>
              )}

              {message && <p role="alert" className="mt-3 text-center text-sm text-destructive">{message}</p>}
              <p className="mt-4 text-center text-[10px] text-muted-foreground">Device {deviceId ? deviceId.slice(0, 8).toUpperCase() : "CHECKING"}</p>
            </div>
          ) : (
            <div className="mt-auto pt-7">
              <div className="grid grid-cols-3 gap-3">
                <Button variant="vault" size="vault" onClick={() => window.open("https://www.metatrader5.com/en/terminal/help/trading/market_watch", "_blank", "noopener,noreferrer")}><BarChart3 className="text-primary" /><span>Quotes</span></Button>
                <Button variant="vault" size="vault" onClick={() => window.open("https://www.metatrader5.com/en/download", "_blank", "noopener,noreferrer")}><Play className="fill-primary text-primary" /><span>Trade</span></Button>
                <Button variant="vault" size="vault" onClick={() => { setScreen("identity"); setLicense(""); setMessage(""); }}><Trash2 className="text-primary" /><span>Remove</span></Button>
              </div>
              <h2 className="my-5 text-center text-sm font-semibold">CONNECTED ROBOTS:</h2>
              <div className="space-y-4">
                <div className="robot-card"><span className="mini-robot overflow-hidden"><img src={robotArtwork.url} alt="" className="h-full w-full object-cover object-top" /></span><strong>CAPITAL VAULT V1.0</strong><span className="status-dot" title="Connected" /></div>
                <div className="robot-card"><span className="mini-robot"><BarChart3 /></span><strong>CHART SCANNER</strong><span className="status-dot" title="Connected" /></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
