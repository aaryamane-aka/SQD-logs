import pptxgen from 'pptxgenjs';
import type { ReportSlide } from './compute';

const NAVY = '0D1B34';
const ROW_BG = '152847';
const HEADER_BG = '1F8A5C';
const LIGHT = 'FFFFFF';
const MUTED = '8EA3C9';
const ACCENT = '2F5FB3';

// Mirrors the in-app slide preview (ReportTab.tsx) 1:1 — same ReportSlide
// model, so the two renderers can't drift out of sync. Runs entirely
// client-side (no backend), fitting this app's static hosting.
export async function downloadReportPptx(slides: ReportSlide[], filenameLabel: string) {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'SQD', width: 10, height: 5.63 });
  pptx.layout = 'SQD';

  slides.forEach((slide) => {
    const s = pptx.addSlide();
    s.background = { color: NAVY };

    if (slide.kind === 'title') {
      s.addText('SUPPLIER QUALITY & DEVELOPMENT', { x: 0.5, y: 1.9, w: 9, h: 0.4, align: 'center', color: MUTED, fontSize: 12 });
      s.addText('Monthly Report', { x: 0.5, y: 2.3, w: 9, h: 0.6, align: 'center', color: LIGHT, fontSize: 28, bold: true });
      s.addText(slide.monthLabel, { x: 0.5, y: 2.9, w: 9, h: 0.4, align: 'center', color: 'C3D0E8', fontSize: 16 });
    }

    if (slide.kind === 'summary') {
      s.addText(`PORTFOLIO SUMMARY — ${slide.monthLabel}`, { x: 0.5, y: 0.35, w: 9, h: 0.4, color: MUTED, fontSize: 12, bold: true });
      const stats: [string, string][] = [
        ['Suppliers Reporting', String(slide.supplierCount)],
        ['Portfolio PPM', slide.portfolioPPM],
        ['Portfolio OTD', slide.portfolioOTD],
        ['Complaints Raised', String(slide.complaintsCount)],
        ['Critical Complaints', String(slide.criticalCount)],
        ['Audits This Month', String(slide.auditsCount)],
      ];
      stats.forEach((row, i) => {
        const col = i % 3;
        const r = Math.floor(i / 3);
        s.addText(row[0], { x: 0.5 + col * 3, y: 1.1 + r * 1.3, w: 2.8, h: 0.3, color: MUTED, fontSize: 10 });
        s.addText(row[1], { x: 0.5 + col * 3, y: 1.4 + r * 1.3, w: 2.8, h: 0.5, color: LIGHT, fontSize: 22, bold: true });
      });
    }

    if (slide.kind === 'okrSummary') {
      s.addText(`OKR SUMMARY — ${slide.monthLabel}`, { x: 0.5, y: 0.3, w: 9, h: 0.35, color: MUTED, fontSize: 12, bold: true });
      const rows: any[] = [
        [
          { text: 'Objective / Key Result', options: { bold: true, fill: { color: HEADER_BG }, color: LIGHT, fontSize: 9 } },
          { text: 'Weight', options: { bold: true, fill: { color: HEADER_BG }, color: LIGHT, fontSize: 9 } },
          { text: 'Score', options: { bold: true, fill: { color: HEADER_BG }, color: LIGHT, fontSize: 9 } },
        ],
      ];
      slide.objectives.forEach((obj) => {
        rows.push([
          { text: obj.title, options: { bold: true, fill: { color: ROW_BG }, color: LIGHT, fontSize: 9 } },
          { text: obj.weightPct != null ? `${obj.weightPct}%` : '', options: { fill: { color: ROW_BG }, color: LIGHT, fontSize: 9 } },
          { text: '', options: { fill: { color: ROW_BG }, color: LIGHT, fontSize: 9 } },
        ]);
        obj.rows.forEach((row) => {
          rows.push([
            { text: '   ' + row.title, options: { color: LIGHT, fontSize: 8.5 } },
            { text: row.weightPct != null ? `${row.weightPct}%` : '—', options: { color: LIGHT, fontSize: 8.5 } },
            { text: row.score != null ? row.score.toFixed(2) : '—', options: { color: LIGHT, fontSize: 8.5 } },
          ]);
        });
      });
      rows.push([
        { text: 'Total', options: { bold: true, color: LIGHT, fontSize: 10 } },
        { text: '', options: { color: LIGHT } },
        { text: slide.totalScore != null ? slide.totalScore.toFixed(2) : '—', options: { bold: true, color: LIGHT, fontSize: 10 } },
      ]);
      s.addTable(rows, { x: 0.5, y: 0.75, w: 9, colW: [6.5, 1.25, 1.25], border: { type: 'solid', color: '2c4372', pt: 0.5 }, autoPage: true });
    }

    if (slide.kind === 'scorecardChart') {
      s.addText(`OVERALL SCORE BY SUPPLIER — ${slide.monthLabel}`, { x: 0.5, y: 0.3, w: 9, h: 0.35, color: MUTED, fontSize: 12, bold: true });
      const values = slide.bars.map((b) => parseFloat(b.scoreDisplay) || 0);
      const labels = slide.bars.map((b) => b.name);
      s.addChart(pptx.ChartType.bar, [{ name: 'Overall Score', labels, values }], {
        x: 0.5,
        y: 0.85,
        w: 9,
        h: 4.5,
        barDir: 'bar',
        showValue: true,
        chartColors: [ACCENT],
        catAxisLabelColor: LIGHT,
        valAxisLabelColor: LIGHT,
        dataLabelColor: LIGHT,
      });
    }

    if (slide.kind === 'supplier') {
      s.addText(slide.supplierName, { x: 0.5, y: 0.3, w: 7, h: 0.5, color: LIGHT, fontSize: 20, bold: true });
      s.addText(`Criticality ${slide.criticality}`, { x: 7, y: 0.35, w: 2.5, h: 0.4, color: MUTED, fontSize: 11, align: 'right' });
      s.addText(`PPM: ${slide.ppm}  /  target ${slide.ppmTarget}`, { x: 0.5, y: 1.1, w: 9, h: 0.35, color: LIGHT, fontSize: 13 });
      s.addText(`OTD: ${slide.otd}  /  target ${slide.otdTarget}`, { x: 0.5, y: 1.55, w: 9, h: 0.35, color: LIGHT, fontSize: 13 });
      s.addText(`Complaints: ${slide.complaintsCount}      Audits: ${slide.auditsCount}`, {
        x: 0.5,
        y: 2.1,
        w: 9,
        h: 0.35,
        color: LIGHT,
        fontSize: 12,
      });
      s.addText(`APQP: ${slide.apqpSummary}`, { x: 0.5, y: 2.5, w: 9, h: 0.35, color: LIGHT, fontSize: 12 });
      s.addText(`Overall Score: ${slide.overallScore} (${slide.overallRating})`, {
        x: 0.5,
        y: 2.95,
        w: 9,
        h: 0.4,
        color: LIGHT,
        fontSize: 14,
        bold: true,
      });
    }

    if (slide.kind === 'closing') {
      s.addText('Thank you', { x: 0.5, y: 2.3, w: 9, h: 0.6, align: 'center', color: LIGHT, fontSize: 24, bold: true });
      s.addText('Generated from live SQD supplier data', { x: 0.5, y: 2.9, w: 9, h: 0.4, align: 'center', color: MUTED, fontSize: 12 });
    }
  });

  await pptx.writeFile({ fileName: `SQD-Monthly-Report-${filenameLabel}.pptx` });
}
