import { NextRequest, NextResponse } from 'next/server';
import { exportDocxBuffer, bodenwert, ertragswert, sachwert } from '@immo/core';
export async function POST(req:NextRequest){
  try{
    const body=await req.json();
    const module:any={};
    if(body.module?.boden){ module['Bodenwert']=bodenwert(body.module.boden); }
    if(body.module?.ertrag){ module['Ertragswert']=ertragswert(body.module.ertrag); }
    if(body.module?.sach){ module['Sachwert']=sachwert(body.module.sach); }
    const buffer= await exportDocxBuffer({ titel: body.titel||'Gutachten', stichtag: body.stichtag||'', module, parameter: body.parameter||{} });
    return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename=Gutachten.docx` } });
  }catch(e:any){
    return NextResponse.json({error:e?.message||String(e)}, {status:400});
  }
}
