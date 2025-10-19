import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, AlignmentType } from 'docx';
import { writeFileSync } from 'fs';
import { CalcResult } from './types';
export async function exportDocx({path, titel, stichtag, module}:{path:string;titel:string;stichtag:string;module:Record<string,CalcResult>;}){
  const doc=new Document({sections:[{children:[ new Paragraph({text:titel,heading:HeadingLevel.TITLE}), new Paragraph(`Stichtag: ${stichtag}`), ...Object.entries(module).flatMap(([name, res])=>[ new Paragraph({text:name, heading: HeadingLevel.HEADING_2}), new Table({rows:[ ...res.protokoll.map(l=> new TableRow({children:[new TableCell({children:[new Paragraph(l.label)]}), new TableCell({children:[new Paragraph({text:String(l.value),alignment:AlignmentType.RIGHT})]})]})), new TableRow({children:[new TableCell({children:[new Paragraph('Ergebnis')]}), new TableCell({children:[new Paragraph(String(res.wert))]})]}) ]}) ]) ]}]});
  const buffer=await Packer.toBuffer(doc); writeFileSync(path, buffer);}
