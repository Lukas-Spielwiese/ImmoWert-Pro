(function(){
  const btnBerechnen=document.getElementById('berechnenBtn')||document.querySelector('[data-action="berechnen"]')||document.querySelector('button[type="submit"]');
  const ampelBadge=document.getElementById('ampelBadge');
  const req={
    stichtag:()=>document.getElementById('stichtag')?.value,
    brw:()=>document.getElementById('brwWert')?.value&&document.getElementById('brwStichtag')?.value&&document.getElementById('brwQuelle')?.value,
    lz:()=>document.getElementById('lz')?.value&&document.getElementById('lzQuelle')?.value,
    swf:()=>document.getElementById('swf')?.value&&document.getElementById('swfQuelle')?.value,
    bpi:()=>document.getElementById('bpi')?.value&&document.getElementById('bpiQuelle')?.value,
    anl5:()=>document.getElementById('anlage5Merkmale')?.value
  };
  const verfahren=()=>({
    v:document.getElementById('chkVergleich')?.checked,
    e:document.getElementById('chkErtrag')?.checked,
    s:document.getElementById('chkSach')?.checked,
    bzV:(document.getElementById('bzVergleich')||{}).value,
    bzE:(document.getElementById('bzErtrag')||{}).value,
    bzS:(document.getElementById('bzSach')||{}).value,
  });
  function computeAmpel(){
    if(!req.stichtag()||!req.brw()||!req.bpi()) return 'red';
    const vf=verfahren();
    if(vf.v && !document.getElementById('vergleichsfaktoren')?.value) return 'yellow';
    if(vf.e && !req.lz()) return 'yellow';
    if(vf.s && (!req.swf() || !req.anl5())) return 'yellow';
    return 'green';
  }
  function paintAmpel(){
    const st=computeAmpel(); if(!ampelBadge) return;
    ampelBadge.classList.remove('ampel--red','ampel--yellow','ampel--green');
    ampelBadge.textContent= st==='green'?'grün':(st==='yellow'?'gelb':'rot');
    ampelBadge.classList.add('ampel--'+st);
  }
  function enforceBlocking(){
    const ok=computeAmpel()!=='red';
    if(btnBerechnen){
      btnBerechnen.disabled=!ok;
      btnBerechnen.title= ok?'' : 'Berechnung gesperrt: Pflichtdaten unvollständig – §§ 9, 12; § 7 i. V. m. § 18 ImmoWertV';
    }
  }
  document.addEventListener('input',()=>{paintAmpel();enforceBlocking();});
  document.addEventListener('change',()=>{paintAmpel();enforceBlocking();});
  paintAmpel(); enforceBlocking();
  function log(id,...lines){ const el=document.getElementById(id); if(el) el.textContent=lines.filter(Boolean).join('
'); }
  window.__logBoden=(a)=>log('log-boden','Formel: BRW × Fläche ± Anpassungen (§§ 40–45)',`Eingaben: BRW=${document.getElementById('brwWert')?.value} €/m²; Fläche=${a?.flaeche} m²; Quelle=${document.getElementById('brwQuelle')?.value}; Stichtag=${document.getElementById('brwStichtag')?.value}`,`Zwischensummen: ${a?.zwischensummen||'-'}`,`Ergebnis Bodenwert: ${a?.ergebnis||'-'} €`);
  window.__logVergleich=(a)=>log('log-vergleich','Formel: normierte Vergleichspreise (Stichtag § 7/§ 18) + Faktoren (§ 26)',`Eingaben: ${a?.beschreibung||'-'}`,`Zwischensummen: ${a?.zwischensummen||'-'}`,`Ergebnis: ${a?.ergebnis||'-'} €`);
  window.__logErtrag=(a)=>log('log-ertrag','Formel: Rohertrag → BK (Anlage 3) → Reinertrag → Bodenwertverzinsung → Gebäudereinertrag → Kapitalisierung (§ 34)',`Eingaben: LZ=${document.getElementById('lz')?.value}% (${document.getElementById('lzQuelle')?.value})`,`Zwischensummen: ${a?.zwischensummen||'-'}`,`Ergebnis: ${a?.ergebnis||'-'} €`);
  window.__logSach=(a)=>log('log-sach','Formel: NHK 2010 (Anlage 4) × BGF → Index (§ 18/§ 36) → Außenanlagen (§ 37) → AWM (§ 38; GND=Anlage 1, ΔRND=Anlage 2) → SWF (§ 39)',`Eingaben: BPI=${document.getElementById('bpi')?.value} (${document.getElementById('bpiQuelle')?.value}); SWF=${document.getElementById('swf')?.value} (${document.getElementById('swfQuelle')?.value})`,`Zwischensummen: ${a?.zwischensummen||'-'}`,`Ergebnis: ${a?.ergebnis||'-'} €`);
  window.__logRechte=(a)=>log('log-rechte','Formel: Rechte & Belastungen (§§ 46–52); Erbbau: Kapitalisierung (§§ 49–52)',`Eingaben: ${a?.beschreibung||'-'}`,`Ergebnis: ${a?.ergebnis||'-'} €`);
})();
