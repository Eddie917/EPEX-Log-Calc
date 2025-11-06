"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, PlusCircle, RefreshCw, Save, Upload, Calculator, Euro, Fuel, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface Leg { id: string; name: string; km: number | ""; }
interface Fee { id: string; name: string; amount: number | ""; }

const fmt2 = (n: number) => (isFinite(n) ? n.toFixed(2) : "0.00");
const toNum = (v: number | "") => (typeof v === "number" ? v : 0);
const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export default function TransportCostCalculator() {
  const [legs, setLegs] = useState<Leg[]>([{ id: crypto.randomUUID(), name: "Úsek 1", km: 0 }]);
  const [prejazdNakladkaKm, setPrejazdNakladkaKm] = useState<number | "">("");

  // No defaults:
  const [consumption, setConsumption] = useState<number | "">("");
  const [fuelPrice, setFuelPrice] = useState<number | "">("");
  const [adbluePct, setAdbluePct] = useState<number | "">("");
  const [adbluePrice, setAdbluePrice] = useState<number | "">("");

  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [driveHours, setDriveHours] = useState<number | "">("");
  const [perDiem, setPerDiem] = useState<number | "">("");

  const [fees, setFees] = useState<Fee[]>([]);
  const [otherCost, setOtherCost] = useState<number | "">("");

  const [marginPct, setMarginPct] = useState<number | "">("");
  const [applyVat, setApplyVat] = useState<boolean>(false);
  const [vatPct, setVatPct] = useState<number | "">("");

  const [presetName, setPresetName] = useState<string>("");

  const totalKm = useMemo(() => toNum(prejazdNakladkaKm) + legs.reduce((s, l) => s + toNum(l.km), 0), [prejazdNakladkaKm, legs]);
  const fuelLiters = useMemo(() => (totalKm * toNum(consumption)) / 100, [totalKm, consumption]);
  const fuelCost = useMemo(() => fuelLiters * toNum(fuelPrice), [fuelLiters, fuelPrice]);
  const adblueLiters = useMemo(() => (fuelLiters * toNum(adbluePct)) / 100, [fuelLiters, adbluePct]);
  const adblueCost = useMemo(() => adblueLiters * toNum(adbluePrice), [adblueLiters, adbluePrice]);
  const feesTotal = useMemo(() => fees.reduce((s, f) => s + toNum(f.amount), 0), [fees]);
  const driverCost = useMemo(() => toNum(hourlyRate) * toNum(driveHours), [hourlyRate, driveHours]);
  const perDiemCost = useMemo(() => toNum(perDiem), [perDiem]);
  const baseCost = useMemo(() => fuelCost + adblueCost + feesTotal + driverCost + perDiemCost + toNum(otherCost), [fuelCost, adblueCost, feesTotal, driverCost, perDiemCost, otherCost]);
  const marginAmt = useMemo(() => (baseCost * toNum(marginPct)) / 100, [baseCost, marginPct]);
  const priceNet = useMemo(() => baseCost + marginAmt, [baseCost, marginAmt]);
  const priceGross = useMemo(() => (applyVat ? priceNet * (1 + toNum(vatPct) / 100) : priceNet), [applyVat, priceNet, vatPct]);
  const costPerKm = useMemo(() => (totalKm > 0 ? baseCost / totalKm : 0), [baseCost, totalKm]);
  const pricePerKm = useMemo(() => (totalKm > 0 ? priceNet / totalKm : 0), [priceNet, totalKm]);

  const pieData = [
    { name: "Palivo", value: fuelCost },
    { name: "AdBlue", value: adblueCost },
    { name: "Mýta/poplatky", value: feesTotal },
    { name: "Vodič", value: driverCost },
    { name: "Diéty", value: perDiemCost },
    { name: "Ostatné", value: toNum(otherCost) },
  ].filter(d => d.value > 0.0001);

  useEffect(() => {
    const saved = localStorage.getItem("transport-cost-preset");
    if (saved) { try { JSON.parse(saved); } catch {} }
  }, []);

  const handleSavePreset = () => {
    const payload = { presetName, legs, prejazdNakladkaKm, consumption, fuelPrice, adbluePct, adbluePrice, hourlyRate, driveHours, perDiem, fees, otherCost, marginPct, applyVat, vatPct };
    localStorage.setItem("transport-cost-preset", JSON.stringify(payload));
    alert("Preset uložený do tohto prehliadača.");
  };
  const handleLoadPreset = () => {
    const s = localStorage.getItem("transport-cost-preset"); if (!s) return alert("Žiadny preset v prehliadači.");
    try {
      const p = JSON.parse(s);
      setPresetName(p.presetName || "");
      setLegs(p.legs || []);
      setPrejazdNakladkaKm(p.prejazdNakladkaKm ?? "");
      setConsumption(p.consumption ?? "");
      setFuelPrice(p.fuelPrice ?? "");
      setAdbluePct(p.adbluePct ?? "");
      setAdbluePrice(p.adbluePrice ?? "");
      setHourlyRate(p.hourlyRate ?? "");
      setDriveHours(p.driveHours ?? "");
      setPerDiem(p.perDiem ?? "");
      setFees(p.fees || []);
      setOtherCost(p.otherCost ?? "");
      setMarginPct(p.marginPct ?? "");
      setApplyVat(!!p.applyVat);
      setVatPct(p.vatPct ?? "");
    } catch { alert("Preset sa nepodarilo načítať."); }
  };
  const resetAll = () => {
    setLegs([{ id: crypto.randomUUID(), name: "Úsek 1", km: 0 }]);
    setConsumption("");
    setFuelPrice("");
    setAdbluePct("");
    setAdbluePrice("");
    setHourlyRate("");
    setDriveHours("");
    setPerDiem("");
    setPrejazdNakladkaKm("");
    setFees([]);
    setOtherCost("");
    setMarginPct("");
    setApplyVat(false);
    setVatPct("");
    setPresetName("");
  };

  const downloadCSV = () => {
    const rows: (string|number)[][] = [
      ["Metrika", "Hodnota"],
      ["Prejazd k nakládke (km)", toNum(prejazdNakladkaKm)],
      ["Km spolu", totalKm],
      ["Palivo (l)", fuelLiters],
      ["Palivo €", fuelCost],
      ["AdBlue (l)", adblueLiters],
      ["AdBlue €", adblueCost],
      ["Mýta/poplatky €", feesTotal],
      ["Vodič €", driverCost],
      ["Diéty €", perDiemCost],
      ["Ostatné €", toNum(otherCost)],
      ["Náklad spolu €", baseCost],
      ["Marža %", toNum(marginPct)],
      ["Marža €", marginAmt],
      ["Cena (bez DPH) €", priceNet],
      ["DPH %", applyVat ? toNum(vatPct) : 0],
      ["Cena (s DPH) €", priceGross],
      ["Náklad/km €", costPerKm],
      ["Cena/km €", pricePerKm],
    ];
    const csv = rows.map(r => r.join(",")).join("
");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `kalkulacia_prepravy_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold tracking-tight">
          Kalkulačka nákladov na prepravu
        </motion.h1>

        <div className="flex flex-wrap gap-2 items-center">
          <Input placeholder="Názov/preset" value={presetName} onChange={(e) => setPresetName(e.target.value)} className="w-56" />
          <Button onClick={handleSavePreset} className="gap-2"><Save size={16}/> Uložiť preset</Button>
          <Button onClick={handleLoadPreset} className="gap-2"><Upload size={16}/> Načítať</Button>
          <Button onClick={resetAll} className="gap-2"><RefreshCw size={16}/> Reset</Button>
          <Button onClick={downloadCSV} className="gap-2"><Download size={16}/> CSV export</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator size={18}/> Trasa a poplatky</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Prejazd k nakládke (km)</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" inputMode="decimal" step="0.1" min="0" value={prejazdNakladkaKm} onChange={(e) => setPrejazdNakladkaKm(e.target.value === "" ? "" : Number(e.target.value))} className="w-40" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Úseky trasy (km)</Label>
                <div className="space-y-2">
                  {legs.map((leg) => (
                    <div key={leg.id} className="flex items-center gap-2">
                      <Input value={leg.name} onChange={(e) => setLegs(v => v.map(x => x.id === leg.id ? { ...x, name: e.target.value } : x))} className="w-40" />
                      <Input type="number" inputMode="decimal" step="0.1" min="0" value={leg.km} onChange={(e) => setLegs(v => v.map(x => x.id === leg.id ? { ...x, km: e.target.value === "" ? "" : Number(e.target.value) } : x))} placeholder="km" />
                      <Button onClick={() => setLegs(v => v.filter(x => x.id !== leg.id))} title="Odstrániť"><Trash2 size={16}/></Button>
                    </div>
                  ))}
                  <Button onClick={() => setLegs(v => [...v, { id: crypto.randomUUID(), name: `Úsek ${v.length + 1}`, km: 0 }])} className="gap-2">
                    <PlusCircle size={16}/> Pridať úsek
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mýta / poplatky / parkovanie</Label>
                <div className="space-y-2">
                  {fees.map((f) => (
                    <div key={f.id} className="flex items-center gap-2">
                      <Input value={f.name} onChange={(e) => setFees(v => v.map(x => x.id === f.id ? { ...x, name: e.target.value } : x))} className="w-40" placeholder="Názov" />
                      <Input type="number" inputMode="decimal" step="0.01" min="0" value={f.amount} onChange={(e) => setFees(v => v.map(x => x.id === f.id ? { ...x, amount: e.target.value === "" ? "" : Number(e.target.value) } : x))} placeholder="€" />
                      <Button onClick={() => setFees(v => v.filter(x => x.id !== f.id))} title="Odstrániť poplatok"><Trash2 size={16}/></Button>
                    </div>
                  ))}
                  <Button onClick={() => setFees(v => [...v, { id: crypto.randomUUID(), name: "Mýto", amount: 0 }])} className="gap-2">
                    <PlusCircle size={16}/> Pridať poplatok
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Fuel size={18}/> Vozidlo a ceny</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>Spotreba (l/100 km)</Label><Input type="number" step="0.1" min="0" value={consumption} onChange={e => setConsumption(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div><Label>Cena paliva (€/l)</Label><Input type="number" step="0.001" min="0" value={fuelPrice} onChange={e => setFuelPrice(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div><Label>AdBlue (% z paliva)</Label><Input type="number" step="0.1" min="0" value={adbluePct} onChange={e => setAdbluePct(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div><Label>Cena AdBlue (€/l)</Label><Input type="number" step="0.01" min="0" value={adbluePrice} onChange={e => setAdbluePrice(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div><Label>Sadzba vodiča (€/h)</Label><Input type="number" step="0.1" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div><Label>Jazda (h)</Label><Input type="number" step="0.1" min="0" value={driveHours} onChange={e => setDriveHours(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div><Label>Diéty (€)</Label><Input type="number" step="0.1" min="0" value={perDiem} onChange={e => setPerDiem(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div className="col-span-2"><Label>Ostatné náklady (€)</Label><Input type="number" step="0.1" min="0" value={otherCost} onChange={e => setOtherCost(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div><Label>Marža (%)</Label><Input type="number" step="0.1" min="0" value={marginPct} onChange={e => setMarginPct(e.target.value === "" ? "" : Number(e.target.value))} /></div>
              <div className="flex items-center gap-3">
                <div><Label>DPH (%)</Label><Input type="number" step="1" min="0" value={vatPct} onChange={e => setVatPct(e.target.value === "" ? "" : Number(e.target.value))} /></div>
                <div className="pt-6 flex items-center gap-2"><Switch checked={applyVat} onCheckedChange={setApplyVat} /><span className="text-sm">Započítať DPH</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Euro size={18}/> Súhrn</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Km spolu" value={`${fmt2(totalKm)} km`} />
                <Stat label="Palivo" value={`${fmt2(fuelLiters)} l / ${fmt2(fuelCost)} €`} />
                <Stat label="AdBlue" value={`${fmt2(adblueLiters)} l / ${fmt2(adblueCost)} €`} />
                <Stat label="Mýta, poplatky" value={`${fmt2(feesTotal)} €`} />
                <Stat label="Vodič" value={`${fmt2(driverCost)} €`} />
                <Stat label="Diéty" value={`${fmt2(perDiemCost)} €`} />
                <Stat label="Ostatné" value={`${fmt2(toNum(otherCost))} €`} />
                <Stat label="Náklad/km" value={`${fmt2(costPerKm)} €/km`} />
                <div className="col-span-2 h-px bg-slate-200 my-2" />
                <Stat label="Náklad spolu" value={`${fmt2(baseCost)} €`} highlight />
                <Stat label="Marža" value={`${fmt2(marginAmt)} € (${fmt2(toNum(marginPct))}%)`} />
                <Stat label="Cena (bez DPH)" value={`${fmt2(priceNet)} €`} highlight />
                <Stat label={applyVat ? `Cena (s DPH ${fmt2(toNum(vatPct))}%)` : "Cena (s DPH)"} value={`${fmt2(priceGross)} €`} highlight />
                <Stat label="Cena/km (bez DPH)" value={`${fmt2(pricePerKm)} €/km`} />
              </div>
            </div>

            {typeof window !== "undefined" && (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${fmt2(Number(v))} €`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500">Tip: Ulož si preset pre každé vozidlo zvlášť.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${highlight ? "bg-indigo-50 border-indigo-200" : "bg-white"}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
