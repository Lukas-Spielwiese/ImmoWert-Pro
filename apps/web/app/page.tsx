'use client';
import { useMemo, useState } from 'react';
import { bodenwert, ertragswert, sachwert } from '@immo/core';
import { Ampel } from './components/Ampel';
export default function Page(){
  const [stichtag,setStichtag]=useState('');
  const [brw,setBrw]=useState('');
  const [flaeche,setFlaeche]=useState('');
  const [bpi,setBpi]=useState('');
  const [lz,setLz]=useState('');
  const disabled= !(stichtag && brw && flaeche && bpi);
  const status = useMemo(()=>{ if(!stichtag||!brw||!bpi) return 'red'; if(!lz) return 'yellow'; return 'green'; },[stichtag,brw,bpi,lz]) as 'red'|'yellow'|'green';
  const [logs,setLogs]=useState<string[]>([]);
  const run=()=>{
    const bw=bodenwert({brw:parseFloat(brw),flaeche:parseFloat(flaeche)});
    const sw=sachwert({nhk:1200,bgf:parseFloat(flaeche),bpiBasis=100 as any,bpiStichtag:parseFloat(bpi),gnd:80,rnd:50,swf:1});
    const ew=ertragswert({rohertrag:12000,bk:3000,bodenwert:bw.wert,lz:parseFloat(lz||'4'),laufzeit:30});
    setLogs([`Bodenwert: ${bw.wert.toFixed(2)}`,`Sachwert: ${sw.wert.toFixed(2)}`,`Ertragswert: ${ew.wert.toFixed(2)}`]);
  };
  return (<main>
    <h1>ImmoWertV 2021 – Demo</h1>
    <p>Modellkonformität: <Ampel status={status} /></p>
    <div style={{display:'grid',gap:8,maxWidth:520}}>
      <label title='§§ 9, 12; § 7/§ 18'>Stichtag* <input type='date' value={stichtag} onChange={e=>setStichtag(e.target.value)} /></label>
      <label title='§§ 40–45; Anlage 5'>BRW [€/m²]* <input value={brw} onChange={e=>setBrw(e.target.value)} /></label>
      <label>anrechenbare Fläche [m²]* <input value={flaeche} onChange={e=>setFlaeche(e.target.value)} /></label>
      <label title='§ 18/§ 36'>BPI (Basis=100)* <input value={bpi} onChange={e=>setBpi(e.target.value)} /></label>
      <label title='§ 33'>Liegenschaftszinssatz [%] <input value={lz} onChange={e=>setLz(e.target.value)} /></label>
    </div>
    <button onClick={run} disabled={disabled} style={{marginTop:12}}>Berechnen (Demo)</button>
    <pre>{logs.join('\n')}</pre>
  </main>);
}
