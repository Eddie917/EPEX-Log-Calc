"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Euro, Calculator, Fuel, Download, Save, Upload, RefreshCw, Trash2, PlusCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface Leg { id: string; name: string; km: number | ""; }
interface Fee { id: string; name: string; amount: number | ""; }

const fmt2 = (n: number) => (isFinite(n) ? n.toFixed(2) : "0.00");
const toNum = (v: number | "") => (typeof v === "number" ? v : 0);
const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"]; 

export default function TransportCostCalculator() {
  const [legs, setLegs] = useState<Leg[]>([{ id: crypto.randomUUID(), name: "Úsek 1", km: 0 }]);
  const [prejazdNakladkaKm, setPrejazdNakladkaKm] = useState<number>(0);
  const [consumption, setConsumption] = useState<number>(12);
  const [fuelPrice, setFuelPrice] = useState<number>(1.60);
  const [adbluePct, setAdbluePct] = useState<number>(0);
  const [adbluePrice, setAdbluePrice] = useState<number>(1.20);
  const [hourlyRate, setHourlyRate] = useState<number>(10);
  const [driveHours, setDriveHours] = useState<number>(0);
  const [workHours, setWorkHours] = useState<number>(0);
  const [perDiem, setPerDiem] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [fees, setFees] = useState<Fee[]>([]);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [extraExpenses, setExtraExpenses] = useState<number>(0);
  const [marginPct, setMarginPct] = useState<number>(0);
  const [applyVat, setApplyVat] = useState<boolean>(false);
  const [vatPct, setVatPct] = useState<number>(20);
  const [presetName, setPresetName] = useState<string>("");

  const totalKm = useMemo(() => prejazdNakladkaKm + legs.reduce((s, l) => s + toNum(l.km), 0), [prejazdNakladkaKm, legs]);
  const fuelLiters = useMemo(() => (totalKm * consumption) / 100, [totalKm, consumption]);
  const fuelCost = useMemo(() => fuelLiters * fuelPrice, [fuelLiters, fuelPrice]);
  const adblueLiters = useMemo(() => (fuelLiters * adbluePct) / 100, [fuelLiters, adbluePct]);
  const adblueCost = useMemo(() => adblueLiters * adbluePrice, [adblueLiters, adbluePrice]);
  const feesTotal = useMemo(() => fees.reduce((s, f) => s + toNum(f.amount), 0), [fees]);
  const driverCost = useMemo(() => hourlyRate * (driveHours + workHours), [hourlyRate, driveHours, workHours]);
  const perDiemCost = useMemo(() => perDiem * days, [perDiem, days]);
  const baseCost = useMemo(() => fuelCost + adblueCost + feesTotal + driverCost + perDiemCost + otherCost + extraExpenses, [fuelCost, adblueCost, feesTotal, driverCost, perDiemCost, otherCost, extraExpenses]);
  const marginAmt = useMemo(() => (baseCost * marginPct) / 100, [baseCost, marginPct]);
  const priceNet = useMemo(() => baseCost + marginAmt, [baseCost, marginAmt]);
  const priceGross = useMemo(() => (applyVat ? priceNet * (1 + vatPct / 100) : priceNet), [applyVat, priceNet, vatPct]);
  const costPerKm = useMemo(() => (totalKm > 0 ? baseCost / totalKm : 0), [baseCost, totalKm]);
  const pricePerKm = useMemo(() => (totalKm > 0 ? priceNet / totalKm : 0), [priceNet, totalKm]);

  const pieData = [
    { name: "Palivo", value: fuelCost },
    { name: "AdBlue", value: adblueCost },
    { name: "Mýta/poplatky", value: feesTotal },
    { name: "Vodič", value: driverCost },
    { name: "Diéty", value: perDiemCost },
    { name: "Ostatné", value: otherCost },
    { name: "Ďalšie výdavky", value: extraExpenses },
  ].filter(d => d.value > 0.0001);

  useEffect(() => { const saved = localStorage.getItem("transport-cost-preset"); if (saved) { try { JSON.parse(saved); } catch {} } }, []);

  const handleSavePreset = () => {
    const payload = { presetName, legs, prejazdNakladkaKm, consumption, fuelPrice, adbluePct, adbluePrice, hourlyRate, driveHours, workHours, perDiem, days, fees, otherCost, extraExpenses, marginPct, applyVat, vatPct };
    localStorage.setItem("transport-cost-preset", JSON.stringify(payload));
    alert("Preset uložený do tohto prehliadača.");
  };
  const handleLoadPreset = () => {
    const s = localStorage.getItem("transport-cost-preset"); if (!s) return alert("Žiadny preset v prehliadači.");
    try {
      const p = JSON.parse(s);
      setPresetName(p.presetName || "");
      setLegs(p.legs || []);
      setPrejazdNakladkaKm(p.prejazdNakladkaKm ?? 0);
      setConsumption(p.consumption ?? 12);
      setFuelPrice(p.fuelPrice ?? 1.6);
      setAdbluePct(p.adbluePct ?? 0);
      setAdbluePrice(p.adbluePrice ?? 1.2);
      setHourlyRate(p.hourlyRate ?? 10);
      setDriveHours(p.driveHours ?? 0);
      setWorkHours(p.workHours ?? 0);
      setPerDiem(p.perDiem ?? 0);
      setDays(p.days ?? 0);
      setFees(p.fees || []);
      setOtherCost(p.otherCost ?? 0);
      setExtraExpenses(p.extraExpenses ?? 0);
      setMarginPct(p.marginPct ?? 0);
      setApplyVat(!!p.applyVat);
      setVatPct(p.vatPct ?? 20);
    } catch { alert("Preset sa nepodarilo načítať."); }
  };
  const resetAll = () => {
    setLegs([{ id: crypto.randomUUID(), name: "Úsek 1", km: 0 }]);
    setConsumption(12); setFuelPrice(1.6); setAdbluePct(0); setAdbluePrice(1.2);
    setHourlyRate(10); setDriveHours(0); setWorkHours(0);
    setPerDiem(0); setDays(0); setPrejazdNakladkaKm(0); setFees([]); setOtherCost(0); setExtraExpenses(0);
    setMarginPct(0); setApplyVat(false); setVatPct(20); setPresetName(""); 
  };

  const downloadCSV = () => {
    const sep = ",";
    const rows: (string|number)[][] = [
      ["Metrika", "Hodnota"],
      ["Prejazd k nakládke (km)", prejazdNakladkaKm],
      ["Km spolu", totalKm],
      ["Palivo (l)", fuelLiters],
      ["Palivo €", fuelCost],
      ["AdBlue (l)", adblueLiters],
      ["AdBlue €", adblueCost],
      ["Mýta/poplatky €", feesTotal],
      ["Vodič €", driverCost],
      ["Diéty €", perDiemCost],
      ["Ostatné €", otherCost],
      ["Ďalšie výdavky €", extraExpenses],
      ["Náklad spolu €", baseCost],
      ["Marža %", marginPct],
      ["Marža €", marginAmt],
      ["Cena (bez DPH) €", priceNet],
      ["DPH %", applyVat ? vatPct : 0],
      ["Cena (s DPH) €", priceGross],
      ["Náklad/km €", costPerKm],
      ["Cena/km €", pricePerKm],
    ];
    const csv = rows.map(r => r.join(sep)).join("\n");
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
                  <Input type="number" inputMode="decimal" step="0.1" min="0" value={prejazdNakladkaKm} onChange={(e) => setPrejazdNakladkaKm(Number(e.target.value))} className="w-40" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Úseky trasy (km)</Label>
                <div className="space-y-2">
                  {legs.map((leg) => (
                    <div key={leg.id} className="flex items-center gap-2">
                      <Input value={leg.name} onChange={(e) => setLegs(v => v.map(x => x.id === leg.id ? { ...x, name: e.target.value } : x))} className="w-40" />
                      <Input type="number" inputMode="decimal" step="0.1" min="0" value={leg.km} onChange={(e) => setLegs(v => v.map(x => x.id === leg.id ? { ...x, km: Number(e.target.value) } : x))} placeholder="km" />
                      <Button onClick={() => setLegs(v => v.filter(x => x.id !== leg.id))} title="Odstrániť"><Trash2 size={16}/></Button>
                    </div>
                  ))}
                  <Button onClick={() => setLegs(v => [...v, { id: crypto.randomUUID(), name: `Úsek ${v.length + 1}`, km: 0 }])} className="gap-2">
                    <PlusCircle size={16}/> Pridať úsek
                  </Button>
                </div>
              </div>

              <div className=\"space-y-2\"> 
                <Label>Mýta / poplatky / parkovanie</Label>
                <div className=\"space-y-2\"> 
                  {fees.map((f) => (
                    <div key={f.id} className=\"flex items-center gap-2\"> 
                      <Input value={f.name} onChange={(e) => setFees(v => v.map(x => x.id === f.id ? { ...x, name: e.target.value } : x))} className=\"w-40\" placeholder=\"Názov\" /> 
                      <Input type=\"number\" inputMode=\"decimal\" step=\"0.01\" min=\"0\" value={f.amount} onChange={(e) => setFees(v => v.map(x => x.id === f.id ? { ...x, amount: Number(e.target.value) } : x))} placeholder=\"€\" /> 
                      <Button onClick={() => setFees(v => v.filter(x => x.id !== f.id))} title=\"Odstrániť poplatok\"><Trash2 size={16}/></Button> 
                    </div>
                  ))}
                  <Button onClick={() => setFees(v => [...v, { id: crypto.randomUUID(), name: \"Mýto\", amount: 0 }])} className=\"gap-2\"> 
                    <PlusCircle size={16}/> Pridať poplatok 
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=\"shadow-sm\"> 
            <CardHeader><CardTitle className=\"flex items-center gap-2\"><Fuel size={18}/> Vozidlo a ceny</CardTitle></CardHeader>
            <CardContent className=\"grid grid-cols-2 gap-4\"> 
              <div><Label>Spotreba (l/100 km)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={consumption} onChange={e => setConsumption(Number(e.target.value))} /></div> 
              <div><Label>Cena paliva (€/l)</Label><Input type=\"number\" step=\"0.001\" min=\"0\" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))} /></div> 
              <div><Label>AdBlue (% z paliva)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={adbluePct} onChange={e => setAdbluePct(Number(e.target.value))} /></div> 
              <div><Label>Cena AdBlue (€/l)</Label><Input type=\"number\" step=\"0.01\" min=\"0\" value={adbluePrice} onChange={e => setAdbluePrice(Number(e.target.value))} /></div> 
              <div><Label>Sadzba vodiča (€/h)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} /></div> 
              <div><Label>Jazda (h)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={driveHours} onChange={e => setDriveHours(Number(e.target.value))} /></div> 
              <div><Label>Práca (h)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={workHours} onChange={e => setWorkHours(Number(e.target.value))} /></div> 
              <div><Label>Diéty (€/deň)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={perDiem} onChange={e => setPerDiem(Number(e.target.value))} /></div> 
              <div><Label>Počet dní</Label><Input type=\"number\" step=\"1\" min=\"0\" value={days} onChange={e => setDays(Number(e.target.value))} /></div> 
              <div className=\"col-span-2\"><Label>Ostatné náklady (€)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={otherCost} onChange={e => setOtherCost(Number(e.target.value))} /></div>
              <div className=\"col-span-2\"><Label>Ďalšie výdavky (mýto, horské priechody…)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={extraExpenses} onChange={e => setExtraExpenses(Number(e.target.value))} /></div> 
              <div><Label>Marža (%)</Label><Input type=\"number\" step=\"0.1\" min=\"0\" value={marginPct} onChange={e => setMarginPct(Number(e.target.value))} /></div> 
              <div className=\"flex items-center gap-3\"><div><Label>DPH (%)</Label><Input type=\"number\" step=\"1\" min=\"0\" value={vatPct} onChange={e => setVatPct(Number(e.target.value))} /></div> 
                <div className=\"pt-6 flex items-center gap-2\"><Switch checked={applyVat} onCheckedChange={setApplyVat} /><span className=\"text-sm\">Započítať DPH</span></div></div> 
            </CardContent>
          </Card>
        </div>

        <Card className=\"shadow-sm\"> 
          <CardHeader><CardTitle className=\"flex items-center gap-2\"><Euro size={18}/> Súhrn a rozpad</CardTitle></CardHeader>
          <CardContent className=\"grid md:grid-cols-2 gap-6 items-start\"> 
            <div className=\"space-y-3\"> 
              <div className=\"grid grid-cols-2 gap-2\"> 
                <Stat label=\"Km spolu\" value={`${fmt2(totalKm)} km`} /> 
                <Stat label=\"Palivo\" value={`${fmt2(fuelLiters)} l / ${fmt2(fuelCost)} €`} /> 
                <Stat label=\"AdBlue\" value={`${fmt2(adblueLiters)} l / ${fmt2(adblueCost)} €`} /> 
                <Stat label=\"Mýta, poplatky\" value={`${fmt2(feesTotal)} €`} /> 
                <Stat label=\"Vodič\" value={`${fmt2(driverCost)} €`} /> 
                <Stat label=\"Diéty\" value={`${fmt2(perDiemCost)} €`} /> 
                <Stat label=\"Ostatné\" value={`${fmt2(otherCost)} €`} /> 
                <Stat label=\"Ďalšie výdavky\" value={`${fmt2(extraExpenses)} €`} /> 
                <Stat label=\"Náklad/km\" value={`${fmt2(costPerKm)} €/km`} /> 
                <div className=\"col-span-2 h-px bg-slate-200 my-2\" /> 
                <Stat label=\"Náklad spolu\" value={`${fmt2(baseCost)} €`} highlight /> 
                <Stat label=\"Marža\" value={`${fmt2(marginAmt)} € (${fmt2(marginPct)}%)`} /> 
                <Stat label=\"Cena (bez DPH)\" value={`${fmt2(priceNet)} €`} highlight /> 
                <Stat label={applyVat ? `Cena (s DPH ${vatPct}%)` : \"Cena (s DPH)\"} value={`${fmt2(priceGross)} €`} highlight /> 
                <Stat label=\"Cena/km (bez DPH)\" value={`${fmt2(pricePerKm)} €/km`} /> 
              </div> 
            </div>

            {typeof window !== 'undefined' && (
              <div className=\"h-72\"> 
                <ResponsiveContainer width=\"100%\" height=\"100%\"> 
                  <PieChart>
                    <Pie data={pieData} dataKey=\"value\" nameKey=\"name\" outerRadius={100} label>
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

        <p className=\"text-xs text-slate-500\">Tip: Ulož si preset pre každé vozidlo zvlášť.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${highlight ? \"bg-indigo-50 border-indigo-200\" : \"bg-white\"}`}>
      <div className=\"text-xs text-slate-500\">{label}</div>
      <div className=\"text-lg font-semibold\">{value}</div>
    </div>
  );
}
