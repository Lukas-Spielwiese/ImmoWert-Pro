'use client';
import { useState } from 'react';
import { bodenwert, ertragswert, sachwert, vergleichswertAusFaellen } from '@immo/core';
 type Ampel='red'|'yellow'|'green';
function AmpelBadge({state}:{state:Ampel}){ return <span className={['ampel',state].join(' ')}>{state==='green'?'grün':state==='yellow'?'gelb':'rot'}</span>; }
export default function Page(){
  const [stichtag,setStichtag]=useState('');
  const [brw,setBrw]=useState(''); const [brwSt,setBrwSt]=useState(''); const [brwQ,setBrwQ]=useState('');
  const [lz,setLz]=useState('');   const [lzQ,setLzQ]=useState('');
  const [swf,setSwf]=useState(''); const [swfQ,setSwfQ]=useState('');
  const [bpi,setBpi]=useState(''); const [bpiQ,setBpiQ]=useState('');
  const [anlage5,setAnlage5]=useState('');
  const [flaeche,setFlaeche]=useState('');
  const [verw,setVerw]=useState(''); const [ihk,setIhk]=useState(''); const [nichtU,setNichtU]=useState(''); const [maw,setMaw]=useState('');
  const [vglCSV,setVglCSV]=useState('');
  const [log,setLog]=useState<string[]>([]);
  const ampel=():Ampel=>{ if(!stichtag||!brw||!brwSt||!brwQ||!bpi||!bpiQ) return 'red'; if(!anlage5||!lz||!lzQ||!swf||!swfQ) return 'yellow'; return 'green'; };
  const disabled= ampel()==='red';
  function parseVgl(){ const rows=vglCSV.split(/\n/).map(r=>r.trim()).filter(Boolean); return rows.map(r=>{ const parts=r.split(',').map(p=>p.trim()); const [datum,preis,flaeche,...rest]=parts; const faktoren:Record<string,number>={}; rest.forEach(kv=>{ const [k,v]=(kv||'').split('='); if(k&&v) faktoren[k]=parseFloat(v); }); return {datum, preis:parseFloat(preis), flaeche:parseFloat(flaeche), faktoren}; }); }
  function run(){
    const bw=bodenwert({ brw:parseFloat(brw), flaeche:parseFloat(flaeche||'0') });
    const sw=sachwert({ nhk:1200, bgf:parseFloat(flaeche||'0'), bpiBasis:100, bpiStichtag:parseFloat(bpi||'100'), gnd:80, rnd:50, swf: parseFloat(swf||'1')||1 });
    const bk=(parseFloat(verw||'0')+parseFloat(ihk||'0')+parseFloat(nichtU||'0')+parseFloat(maw||'0'))||0;
    const ew=ertragswert({ rohertrag:12000, bk, bodenwert:bw.wert, lz: parseFloat(lz||'4')||4, laufzeit:30 });
    const faelle=parseVgl(); const vw=vergleichswertAusFaellen(faelle, { zielStichtag: stichtag, indexFaktor: ()=>1 });
    const result=(bw.wert+vw.wert+ew.wert+sw.wert)/4;
    setLog([`Bodenwert: ${bw.wert.toFixed(2)}`, `Vergleichswert: ${vw.wert.toFixed(2)}`, `Ertragswert: ${ew.wert.toFixed(2)}`, `Sachwert: ${sw.wert.toFixed(2)}`, `Plausibilisiert (§6, Ø): ${result.toFixed(2)}`]);
  }
  async function exportDoc(){
    const body={ titel:'Gutachten', stichtag, parameter:{ BRW:`${brw} €/m² (${brwQ}, ${brwSt})`, BPI:`${bpi} (${bpiQ})`, SWF:`${swf} (${swfQ})`, LZ:`${lz} (${lzQ})`, 'Anlage 5':anlage5 },
      module:{ boden:{ brw:parseFloat(brw), flaeche:parseFloat(flaeche||'0') }, sach:{ nhk:1200, bgf:parseFloat(flaeche||'0'), bpiBasis:100, bpiStichtag:parseFloat(bpi||'100'), gnd:80, rnd:50, swf: parseFloat(swf||'1')||1 }, ertrag:{ rohertrag:12000, bk:(parseFloat(verw||'0')+parseFloat(ihk||'0')+parseFloat(nichtU||'0')+parseFloat(maw||'0')), bodenwert:0, lz: parseFloat(lz||'4')||4, laufzeit:30 } } };
    const res=await fetch('/api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!res.ok){ alert('Export fehlgeschlagen'); return; }
    const blob=await res.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='Gutachten.docx'; a.click(); URL.revokeObjectURL(url);
  }
  return (<main>
    <h1>ImmoWertV 2021 – Bewertungsassistent</h1>
    <p className='small'>Berechnung nur mit gültigen Stichtagen/Quellen (§§ 9, 12; § 7 i.V.m. § 18/§ 36).</p>
    <p>Modellkonformität: <AmpelBadge state={ampel()} /></p>
    <h2>Stammdaten & Rechtsrahmen</h2>
    <label>Wertermittlungsstichtag* <input type='date' value={stichtag} onChange={e=>setStichtag(e.target.value)}/></label>
    <h2>Datenbasis (Quellen & Stichtage)</h2>
    <fieldset><legend>BRW (§§ 40–45; Anlage 5)</legend><div className='row'>
      <label>BRW [€/m²]* <input value={brw} onChange={e=>setBrw(e.target.value)}/></label>
      <label>Stichtag* <input type='date' value={brwSt} onChange={e=>setBrwSt(e.target.value)}/></label>
      <label>Quelle* <input value={brwQ} onChange={e=>setBrwQ(e.target.value)}/></label>
      <label>Anlage-5-Merkmale* <textarea value={anlage5} onChange={e=>setAnlage5(e.target.value)}/></label>
    </div></fieldset>
    <fieldset><legend>Liegenschaftszinssatz (§ 33)</legend><div className='row'>
      <label>LZ [%]* <input value={lz} onChange={e=>setLz(e.target.value)}/></label>
      <label>Quelle/Stichtag* <input value={lzQ} onChange={e=>setLzQ(e.target.value)}/></label>
    </div></fieldset>
    <fieldset><legend>Sachwertfaktor (§ 39)</legend><div className='row'>
      <label>SWF* <input value={swf} onChange={e=>setSwf(e.target.value)}/></label>
      <label>Quelle/Stichtag* <input value={swfQ} onChange={e=>setSwfQ(e.target.value)}/></label>
    </div></fieldset>
    <fieldset><legend>Indexreihen (§ 18/§ 36)</legend><div className='row'>
      <label>BPI (Basis=100)* <input value={bpi} onChange={e=>setBpi(e.target.value)}/></label>
      <label>Quelle/Stichtag* <input value={bpiQ} onChange={e=>setBpiQ(e.target.value)}/></label>
    </div></fieldset>
    <h2>Objekt</h2>
    <label>Anrechenbare Fläche [m²]* <input value={flaeche} onChange={e=>setFlaeche(e.target.value)}/></label>
    <h2>Ertragswert – Anlage 3</h2>
    <div className='row'>
      <label>Verwaltung [€/a] <input value={verw} onChange={e=>setVerw(e.target.value)}/></label>
      <label>Instandhaltung [€/a] <input value={ihk} onChange={e=>setIhk(e.target.value)}/></label>
      <label>Nicht umlagefähig [€/a] <input value={nichtU} onChange={e=>setNichtU(e.target.value)}/></label>
      <label>Mietausfall [€/a] <input value={maw} onChange={e=>setMaw(e.target.value)}/></label>
    </div>
    <h2>Vergleichsfälle (CSV)</h2>
    <textarea placeholder={'datum,preis,flaeche,faktor_lage=1.03,faktor_zustand=0.98\n2024-06-01,450000,120\n2025-03-12,470000,118'} value={vglCSV} onChange={e=>setVglCSV(e.target.value)}/>
    <div style={{display:'flex',gap:8,marginTop:12}}><button onClick={run} disabled={disabled}>Berechnen</button><button onClick={exportDoc} disabled={disabled}>DOCX-Export</button></div>
    <details><summary>Rechenprotokoll (Kurz)</summary><pre>{log.join('\n')}</pre></details>
  </main>);
}
