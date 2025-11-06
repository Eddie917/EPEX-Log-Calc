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
  // Route
  const [legs, setLegs] = useState<Leg[]>([{ id: crypto.randomUUID(), name: "Úsek 1", km: 0 }]);
  const [prejazdNakladkaKm, setPrejazdNakladkaKm] = useState<number | "">("");

  // Vehicle & fuel (no default numbers)
  const [consumption, setConsumption] = useState<number | "">(""); // l/100 km
  const [fuelPrice, setFuelPrice]     = useState<number | "">(""); // €/l
  const [adbluePct, setAdbluePct]     = useState<number | "">(""); // % of fuel
  const [adbluePrice, setAdbluePrice] = useState<number | "">(""); // €/l

  // Driver
  const [hourlyRate, setHourlyRate]   = useState<number | "">(""); // €/h
  const [driveHours, setDriveHours]   = useState<number | "">(""); // h
  // Per diem total €
  const [perDiem, setPerDiem]         = useState<number | "">("");

  // Fees & other
  const [fees, setFees]               = useState<Fee[]>([]);
  const [otherCost, setOtherCost]     = useState<number | \"\">(\"\");

  // Pricing
  const [marginPct, setMarginPct]     = useState<number | \"\">(\"\"); // %
  const [applyVat, setApplyVat]       = useState<boolean>(false);
  const [vatPct, setVatPct]           = useState<number | \"\">(\"\"); // %

  // Preset name
  const [presetName, setPresetName]   = useState<string>(\"\");

  // Derived
  const totalKm      = useMemo(() => toNum(prejazdNakladkaKm) + legs.reduce((s, l) => s + toNum(l.km), 0), [prejazdNakladkaKm, legs]);
  const fuelLiters   = useMemo(() => (totalKm * toNum(consumption)) / 100, [totalKm, consumption]);
  const fuelCost     = useMemo(() => fuelLiters * toNum(fuelPrice), [fuelLiters, fuelPrice]);
  const adblueLiters = useMemo(() => (fuelLiters * toNum(adbluePct)) / 100, [fuelLiters, adbluePct]);
  const adblueCost   = useMemo(() => adblueLiters * toNum(adbluePrice), [adblueLiters, adbluePrice]);
  const feesTotal    = useMemo(() => fees.reduce((s, f) => s + toNum(f.amount), 0), [fees]);
  const driverCost   = useMemo(() => toNum(hourlyRate) * toNum(driveHours), [hourlyRate, driveHours]);
  const perDiemCost  = useMemo(() => toNum(perDiem), [perDiem]);
  const baseCost     = useMemo(() => fuelCost + adblueCost + feesTotal + driverCost + perDiemCost + toNum(otherCost), [fuelCost, adblueCost, feesTotal, driverCost, perDiemCost, otherCost]);
  const marginAmt    = useMemo(() => (baseCost * toNum(marginPct)) / 100, [baseCost, marginPct]);
  const priceNet     = useMemo(() => baseCost + marginAmt, [baseCost, marginAmt]);
  const priceGross   = useMemo(() => (applyVat ? priceNet * (1 + toNum(vatPct) / 100) : priceNet), [applyVat, priceNet, vatPct]);
  const costPerKm    = useMemo(() => (totalKm > 0 ? baseCost / totalKm : 0), [baseCost, totalKm]);
  const pricePerKm   = useMemo(() => (totalKm > 0 ? priceNet / totalKm : 0), [priceNet, totalKm]);

  const pieData = [
    { name: \"Palivo\", value: fuelCost },
    { name: \"AdBlue\", value: adblueCost },
    { name: \"Mýta/poplatky\", value: feesTotal },
    { name: \"Vodič\", value: driverCost },
    { name: \"Diéty\", value: perDiemCost },
    { name: \"Ostatné\", value: toNum(otherCost) },
  ].filter(d => d.value > 0.0001);

  // Presets (local storage)
  useEffect(() => {
    const saved = localStorage.getItem(\"transport-cost-preset\");
    if (saved) { try { JSON.parse(saved); } catch {} }
  }, []);

  const handleSavePreset = () => {
    const payload = {
      presetName, legs, prejazdNakladkaKm,
      consumption, fuelPrice, adbluePct, adbluePrice,
      hourlyRate, driveHours, perDiem,
      fees, otherCost, marginPct, applyVat, vatPct
    };
    localStorage.setItem(\"transport-cost-preset\", JSON.stringify(payload));
    alert(\"Preset uložený do tohto prehliadača.\");
  };

  const handleLoadPreset = () => {
    const s = localStorage.getItem(\"transport-cost-preset\");
    if (!s) return alert(\"Žiadny preset v prehliadači.\");
    try {
      const p = JSON.parse(s);
      setPresetName(p.presetName || \"\");
      setLegs(p.legs || []);
      setPrejazdNakladkaKm(p.prejazdNakladkaKm ?? \"\");
      setConsumption(p.consumption ?? \"\");
      setFuelPrice(p.fuelPrice ?? \"\");
      setAdbluePct(p.adbluePct ?? \"\");
      setAdbluePrice(p.adbluePrice ?? \"\");
      setHourlyRate(p.hourlyRate ?? \"\");
      setDriveHours(p.driveHours ?? \"\");
      setPerDiem(p.perDiem ?? \"\");
      setFees(p.fees || []);
      setOtherCost(p.otherCost ?? \"\");
      setMarginPct(p.marginPct ?? \"\");
      setApplyVat(!!p.applyVat);
      setVatPct(p.vatPct ?? \"\");
    } catch {
      alert(\"Preset sa nepodarilo načítať.\");
    }
  };

  const resetAll = () => {
    setLegs([{ id: crypto.randomUUID(), name: \"Úsek 1\", km: 0 }]);
    setPrejazdNakladkaKm(\"\");
    setConsumption(\"\");
    setFuelPrice(\"\");
    setAdbluePct(\"\");
    setAdbluePrice(\"\");
    setHourlyRate(\"\");
    setDriveHours(\"\");
    setPerDiem(\"\");
    setFees([]);
    setOtherCost(\"\");
    setMarginPct(\"\");
    setApplyVat(false);
    setVatPct(\"\");
    setPresetName(\"\");
  };

  const downloadCSV = () => {
    const rows: (string|number)[][] = [
      [\"Metrika\", \"Hodnota\"],
      [\"Prejazd k nakládke (km)\", toNum(prejazdNakladkaKm)],
      [\"Km spolu\", totalKm],
      [\"Palivo (l)\", fuelLiters],
      [\"Palivo €\", fuelCost],
      [\"AdBlue (l)\", adblueLiters],
      [\"AdBlue €\", adblueCost],
      [\"Mýta/poplatky €\", feesTotal],
      [\"Vodič €\", driverCost],
      [\"Diéty €\", perDiemCost],
      [\"Ostatné €\", toNum(otherCost)],
      [\"Náklad spolu €\", baseCost],
      [\"Marža %\", toNum(marginPct)],
      [\"Marža €\", marginAmt],
      [\"Cena (bez DPH) €\", priceNet],
      [\"DPH %\", applyVat ? toNum(vatPct) : 0],
      [\"Cena (s DPH) €\", priceGross],
      [\"Náklad/km €\", costPerKm],
      [\"Cena/km €\", pricePerKm],
    ];
    const csv = rows.map(r => r.join(\",\")).join(\"\n\");
    const blob = new Blob([csv], { type: \"text/csv;charset=utf-8;\" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement(\"a\"); a.href = url;
    a.download = `kalkulacia_prepravy_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className=\"min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-4 md:p-8\">\n      <div className=\"mx-auto max-w-6xl space-y-6\">\n        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className=\"text-3xl md:text-4xl font-bold tracking-tight\">\n          Kalkulačka nákladov na prepravu\n        </motion.h1>\n\n        <div className=\"flex flex-wrap gap-2 items-center\">\n          <Input placeholder=\"Názov/preset\" value={presetName} onChange={(e) => setPresetName(e.target.value)} className=\"w-56\" />\n          <Button onClick={handleSavePreset} className=\"gap-2\"><Save size={16}/> Uložiť preset</Button>\n          <Button onClick={handleLoadPreset} className=\"gap-2\"><Upload size={16}/> Načítať</Button>\n          <Button onClick={resetAll} className=\"gap-2\"><RefreshCw size={16}/> Reset</Button>\n          <Button onClick={downloadCSV} className=\"gap-2\"><Download size={16}/> CSV export</Button>\n        </div>\n\n        <div className=\"grid md:grid-cols-2 gap-6\">\n          <Card className=\"shadow-sm\">\n            <CardHeader><CardTitle className=\"flex items-center gap-2\"><Calculator size={18}/> Trasa a poplatky</CardTitle></CardHeader>\n            <CardContent className=\"space-y-4\">\n              <div className=\"space-y-2\">\n                <Label>Prejazd k nakládke (km)</Label>\n                <div className=\"flex items-center gap-2\">\n                  <Input type=\"number\" inputMode=\"decimal\" step=\"0.1\" min=\"0\" value={prejazdNakladkaKm} onChange={(e) => setPrejazdNakladkaKm(e.target.value === \"\" ? \"\" : Number(e.target.value))} className=\"w-40\" />\n                </div>\n              </div>\n\n              <div className=\"space-y-2\">\n                <Label>Úseky trasy (km)</Label>\n                <div className=\"space-y-2\">\n                  {legs.map((leg) => (\n                    <div key={leg.id} className=\"flex items-center gap-2\">\n                      <Input value={leg.name} onChange={(e) => setLegs(v => v.map(x => x.id === leg.id ? { ...x, name: e.target.value } : x))} className=\"w-40\" />\n                      <Input type=\"number\" inputMode=\"decimal\" step=\"0.1\" min=\"0\" value={leg.km} onChange={(e) => setLegs(v => v.map(x => x.id === leg.id ? { ...x, km: e.target.value === \"\" ? \"\" : Number(e.target.value) } : x))} placeholder=\"km\" />\n                      <Button onClick={() => setLegs(v => v.filter(x => x.id !== leg.id))} title=\"Odstrániť\"><Trash2 size={16}/></Button>\n                    </div>\n                  ))}\n                  <Button onClick={() => setLegs(v => [...v, { id: crypto.randomUUID(), name: `Úsek ${v.length + 1}`, km: 0 }])} className=\"gap-2\">\n                    <PlusCircle size={16}/> Pridať úsek\n                  </Button>\n                </div>\n              </div>\n\n              <div className=\"space-y-2\">\n                <Label>Mýta / poplatky / parkovanie</Label>\n                <div className=\"space-y-2\">\n                  {fees.map((f) => (\n                    <div key={f.id} className=\"flex items-center gap-2\">\n                      <Input value={f.name} onChange={(e) => setFees(v => v.map(x => x.id === f.id ? { ...x, name: e.target.value } : x))} className=\"w-40\" placeholder=\"Názov\" />\n                      <Input type=\"number\" inputMode=\"decimal\" step=\"0.01\" min=\"0\" value={f.amount} onChange={(e) => setFees(v => v.map(x => x.id === f.id ? { ...x, amount: e.target.value === \"\" ? \"\" : Number(e.target.value) } : x))} placeholder=\"€\" />\n                      <Button onClick={() => setFees(v => v.filter(x => x.id !== f.id))} title=\"Odstrániť poplatok\"><Trash2 size={16}/></Button>\n                    </div>\n                  ))}\n                  <Button onClick={() => setFees(v => [...v, { id: crypto.randomUUID(), name: \"Mýto\", amount: 0 }])} className=\"gap-2\">\n                    <PlusCircle size={16}/> Pridať poplatok\n                  </Button>\n                </div>\n              </div>\n            </CardContent>\n          </Card>\n\n          <Card className=\"shadow-sm\">\n            <CardHeader><CardTitle className=\"flex items-center gap-2\"><Fuel size={18}/> Vozidlo a ceny</CardTitle></CardHeader>\n            <CardContent className=\"grid grid-cols-2 gap-4\">\n              <div><Label>Spotreba (l/100 km)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={consumption} onChange={e => setConsumption(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div><Label>Cena paliva (€/l)</Label><Input type=\"number\" step=\"0.001\" min=\"0\" value={fuelPrice} onChange={e => setFuelPrice(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div><Label>AdBlue (% z paliva)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={adbluePct} onChange={e => setAdbluePct(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div><Label>Cena AdBlue (€/l)</Label><Input type=\"number\" step=\"0.01\" min=\"0\" value={adbluePrice} onChange={e => setAdbluePrice(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div><Label>Sadzba vodiča (€/h)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={hourlyRate} onChange={e => setHourlyRate(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div><Label>Jazda (h)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={driveHours} onChange={e => setDriveHours(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div><Label>Diéty (€)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={perDiem} onChange={e => setPerDiem(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div className=\"col-span-2\"><Label>Ostatné náklady (€)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={otherCost} onChange={e => setOtherCost(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div><Label>Marža (%)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={marginPct} onChange={e => setMarginPct(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n              <div className=\"flex items-center gap-3\">\n                <div><Label>DPH (%)</Label><Input type=\"number\" step=\"1\" min=\"0\" value={vatPct} onChange={e => setVatPct(e.target.value === \"\" ? \"\" : Number(e.target.value))} /></div>\n                <div className=\"pt-6 flex items-center gap-2\"><Switch checked={applyVat} onCheckedChange={setApplyVat} /><span className=\"text-sm\">Započítať DPH</span></div>\n              </div>\n            </CardContent>\n          </Card>\n        </div>\n\n        <Card className=\"shadow-sm\">\n          <CardHeader><CardTitle className=\"flex items-center gap-2\"><Euro size={18}/> Súhrn</CardTitle></CardHeader>\n          <CardContent className=\"grid md:grid-cols-2 gap-6 items-start\">\n            <div className=\"space-y-3\">\n              <div className=\"grid grid-cols-2 gap-2\">\n                <Stat label=\"Km spolu\" value={`${fmt2(totalKm)} km`} />\n                <Stat label=\"Palivo\" value={`${fmt2(fuelLiters)} l / ${fmt2(fuelCost)} €`} />\n                <Stat label=\"AdBlue\" value={`${fmt2(adblueLiters)} l / ${fmt2(adblueCost)} €`} />\n                <Stat label=\"Mýta, poplatky\" value={`${fmt2(feesTotal)} €`} />\n                <Stat label=\"Vodič\" value={`${fmt2(driverCost)} €`} />\n                <Stat label=\"Diéty\" value={`${fmt2(perDiemCost)} €`} />\n                <Stat label=\"Ostatné\" value={`${fmt2(toNum(otherCost))} €`} />\n                <Stat label=\"Náklad/km\" value={`${fmt2(costPerKm)} €/km`} />\n                <div className=\"col-span-2 h-px bg-slate-200 my-2\" />\n                <Stat label=\"Náklad spolu\" value={`${fmt2(baseCost)} €`} highlight />\n                <Stat label=\"Marža\" value={`${fmt2(marginAmt)} € (${fmt2(toNum(marginPct))}%)`} />\n                <Stat label=\"Cena (bez DPH)\" value={`${fmt2(priceNet)} €`} highlight />\n                <Stat label={applyVat ? `Cena (s DPH ${fmt2(toNum(vatPct))}%)` : \"Cena (s DPH)\"} value={`${fmt2(priceGross)} €`} highlight />\n                <Stat label=\"Cena/km (bez DPH)\" value={`${fmt2(pricePerKm)} €/km`} />\n              </div>\n            </div>\n\n            {typeof window !== \"undefined\" && (\n              <div className=\"h-72\">\n                <ResponsiveContainer width=\"100%\" height=\"100%\">\n                  <PieChart>\n                    <Pie data={pieData} dataKey=\"value\" nameKey=\"name\" outerRadius={100} label>\n                      {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}\n                    </Pie>\n                    <Tooltip formatter={(v: number) => `${fmt2(Number(v))} €`} />\n                    <Legend />\n                  </PieChart>\n                </ResponsiveContainer>\n              </div>\n            )}\n          </CardContent>\n        </Card>\n\n        <p className=\"text-xs text-slate-500\">Tip: Ulož si preset pre každé vozidlo zvlášť.</p>\n      </div>\n    </div>\n  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${highlight ? \"bg-indigo-50 border-indigo-200\" : \"bg-white\"}`}>
      <div className=\"text-xs text-slate-500\">{label}</div>
      <div className=\"text-lg font-semibold\">{value}</div>
    </div>
  );
}
