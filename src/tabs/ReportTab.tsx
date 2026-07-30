import { Fragment, useMemo, useState } from 'react';
import { buildReportSlides, fmtMonth, getAvailableMonths, type DashboardData } from '../lib/compute';
import { buildOkrSlideData } from '../lib/okr';
import { downloadReportPptx } from '../lib/pptxExport';
import type { KeyResult, Objective, OkrMonthlyEntry, Supplier } from '../lib/types';

interface Props {
  data: DashboardData;
  suppliers: Supplier[];
  okrObjectives?: Objective[];
  okrKeyResults?: KeyResult[];
  okrMonthlyEntries?: OkrMonthlyEntry[];
}

export function ReportTab({ data, suppliers, okrObjectives, okrKeyResults, okrMonthlyEntries }: Props) {
  const availableMonthKeys = useMemo(() => getAvailableMonths(data), [data]);
  const [month, setMonth] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [exporting, setExporting] = useState(false);

  const okrSlideData = useMemo(
    () =>
      okrObjectives && okrKeyResults && okrMonthlyEntries
        ? buildOkrSlideData(okrObjectives, okrKeyResults, okrMonthlyEntries, month)
        : null,
    [okrObjectives, okrKeyResults, okrMonthlyEntries, month]
  );
  const slides = useMemo(() => buildReportSlides(month, suppliers, data, okrSlideData), [month, suppliers, data, okrSlideData]);
  const idx = Math.min(slideIndex, Math.max(0, slides.length - 1));
  const slide = slides[idx];

  async function handleDownload() {
    setExporting(true);
    try {
      await downloadReportPptx(slides, month || 'report');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="main-header">
        <div className="main-title">Monthly Report</div>
      </div>

      {availableMonthKeys.length === 0 ? (
        <div className="empty-state large">
          <div className="title">Nothing to report yet</div>
          <div>Add Monthly PPM or Delivery Performance entries to generate a monthly report.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Report month</label>
            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setSlideIndex(0);
              }}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d7dbe2', fontSize: 13 }}
            >
              <option value="">Select month</option>
              {availableMonthKeys.map((m) => (
                <option key={m} value={m}>
                  {fmtMonth(m)}
                </option>
              ))}
            </select>
          </div>

          {slide && (
            <div style={{ maxWidth: 920 }}>
              <div className="slide">
                {slide.kind === 'title' && (
                  <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <div className="slide-eyebrow">Supplier Quality &amp; Development</div>
                    <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>Monthly Report</div>
                    <div style={{ fontSize: 18, color: '#c3d0e8' }}>{slide.monthLabel}</div>
                  </div>
                )}

                {slide.kind === 'summary' && (
                  <div>
                    <div className="slide-eyebrow">Portfolio Summary — {slide.monthLabel}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                      <SlideStat label="Suppliers Reporting" value={slide.supplierCount} />
                      <SlideStat label="Portfolio PPM" value={slide.portfolioPPM} />
                      <SlideStat label="Portfolio OTD" value={slide.portfolioOTD} />
                      <SlideStat label="Complaints Raised" value={slide.complaintsCount} />
                      <SlideStat label="Critical Complaints" value={slide.criticalCount} color="#ff9c9c" />
                      <SlideStat label="Audits This Month" value={slide.auditsCount} />
                    </div>
                  </div>
                )}

                {slide.kind === 'okrSummary' && (
                  <div style={{ width: '100%', overflowY: 'auto' }}>
                    <div className="slide-eyebrow">OKR Summary — {slide.monthLabel}</div>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '4px 8px', background: '#1f8a5c', color: '#fff' }}>Objective / Key Result</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', background: '#1f8a5c', color: '#fff', width: 70 }}>Weight</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', background: '#1f8a5c', color: '#fff', width: 70 }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slide.objectives.map((obj) => (
                          <Fragment key={obj.title}>
                            <tr style={{ background: '#152847' }}>
                              <td style={{ padding: '4px 8px', fontWeight: 700 }}>{obj.title}</td>
                              <td style={{ padding: '4px 8px', textAlign: 'right' }}>{obj.weightPct != null ? `${obj.weightPct}%` : ''}</td>
                              <td></td>
                            </tr>
                            {obj.rows.map((row) => (
                              <tr key={row.title}>
                                <td style={{ padding: '3px 8px 3px 20px' }}>{row.title}</td>
                                <td style={{ padding: '3px 8px', textAlign: 'right', color: '#8ea3c9' }}>
                                  {row.weightPct != null ? `${row.weightPct}%` : '—'}
                                </td>
                                <td className="mono" style={{ padding: '3px 8px', textAlign: 'right' }}>
                                  {row.score != null ? row.score.toFixed(2) : '—'}
                                </td>
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                        <tr style={{ borderTop: '2px solid #2c4372', fontWeight: 700 }}>
                          <td style={{ padding: '6px 8px' }}>Total</td>
                          <td></td>
                          <td className="mono" style={{ padding: '6px 8px', textAlign: 'right' }}>
                            {slide.totalScore != null ? slide.totalScore.toFixed(2) : '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {slide.kind === 'scorecardChart' && (
                  <div style={{ width: '100%' }}>
                    <div className="slide-eyebrow">Overall Score by Supplier — {slide.monthLabel}</div>
                    {slide.bars.map((b) => (
                      <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 180, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.name}
                        </div>
                        <div style={{ flex: 1, height: 16, background: '#152847', borderRadius: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 8, background: b.ratingColor, width: b.widthPctStr }} />
                        </div>
                        <div style={{ width: 60, fontSize: 12, fontFamily: 'var(--mono)', textAlign: 'right' }}>{b.scoreDisplay}</div>
                      </div>
                    ))}
                  </div>
                )}

                {slide.kind === 'supplier' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{slide.supplierName}</div>
                      <div style={{ fontSize: 13, color: '#8ea3c9' }}>Criticality {slide.criticality}</div>
                    </div>
                    <BarRow label="PPM" actualPct={slide.ppmActualPctStr} targetPct={slide.ppmTargetPctStr} actualColor="#ff9c9c" value={slide.ppm} target={slide.ppmTarget} />
                    <BarRow label="OTD" actualPct={slide.otdActualPctStr} targetPct={slide.otdTargetPctStr} actualColor="#7fb3ff" value={slide.otd} target={slide.otdTarget} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#8ea3c9' }}>Complaints</div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)' }}>{slide.complaintsCount}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#8ea3c9' }}>Audits</div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)' }}>{slide.auditsCount}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#8ea3c9' }}>APQP Parts</div>
                        <div style={{ fontSize: 15, fontWeight: 600, paddingTop: 5 }}>{slide.apqpSummary}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#8ea3c9' }}>Overall Score</div>
                        <div style={{ fontSize: 15, fontWeight: 600, paddingTop: 5 }}>
                          {slide.overallScore} ({slide.overallRating})
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {slide.kind === 'closing' && (
                  <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Thank you</div>
                    <div style={{ fontSize: 13, color: '#8ea3c9' }}>Generated from live SQD supplier data</div>
                  </div>
                )}

                <div className="slide-index">
                  {idx + 1} / {slides.length}
                </div>
              </div>

              <div className="slide-nav">
                <button className="btn" onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}>
                  ← Previous
                </button>
                <button className="btn btn-primary" onClick={handleDownload} disabled={exporting}>
                  {exporting ? 'Preparing…' : 'Download .pptx'}
                </button>
                <button className="btn" onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SlideStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#8ea3c9' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--mono)', color: color || '#fff' }}>{value}</div>
    </div>
  );
}

function BarRow({
  label,
  actualPct,
  targetPct,
  actualColor,
  value,
  target,
}: {
  label: string;
  actualPct: string;
  targetPct: string;
  actualColor: string;
  value: string | number;
  target: string | number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ width: 60, fontSize: 11, color: '#8ea3c9' }}>{label}</div>
      <div style={{ flex: 1, height: 12, background: '#152847', borderRadius: 6, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: actualColor, borderRadius: 6, width: actualPct }} />
        <div style={{ position: 'absolute', top: -3, bottom: -3, width: 2, background: '#fff', left: targetPct }} />
      </div>
      <div style={{ width: 110, fontSize: 12, fontFamily: 'var(--mono)', textAlign: 'right' }}>
        {value} <span style={{ color: '#6f86ad' }}>/ {target}</span>
      </div>
    </div>
  );
}
