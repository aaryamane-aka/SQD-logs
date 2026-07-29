import type {
  ApqpPart,
  DeliveryPerformance,
  MonthlyPPM,
  QualityComplaint,
  Supplier,
  SupplierAudit,
  TechnicalReview,
} from './types';

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtMonth(m: string | null | undefined): string {
  if (!m) return '—';
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function quarterOf(m: string | null | undefined): string {
  if (!m) return '—';
  const parts = m.split('-').map(Number);
  return `Q${Math.ceil(parts[1] / 3)} ${parts[0]}`;
}

export function diffDays(a: string | null | undefined, b: string | null | undefined): number | null {
  if (!a || !b) return null;
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

export type Rating = 'A' | 'B' | 'C' | 'D' | '—';

export function ratingFromScore(score: number | null | undefined): Rating {
  if (score == null || isNaN(score)) return '—';
  return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
}

export function ratingColor(r: Rating): string {
  return r === 'A' ? '#1f8a5c' : r === 'B' ? '#2f6fb3' : r === 'C' ? '#b4790a' : r === 'D' ? '#c23b3b' : '#6b7280';
}

export function supplierName(suppliers: Supplier[], id: string | null | undefined): string {
  const s = suppliers.find((x) => x.id === id);
  return s ? s.name : '—';
}

const today = () => new Date().toISOString().slice(0, 10);

export function enrichTechnicalReview(r: TechnicalReview) {
  const daysLate =
    r.status === 'Closed'
      ? diffDays(r.actual_closure, r.target_closure)
      : r.status === 'Overdue'
      ? diffDays(today(), r.target_closure)
      : null;
  return { ...r, daysLate };
}

export function enrichComplaint(r: QualityComplaint) {
  const daysOpen = diffDays(r.actual_close || today(), r.date_raised);
  return { ...r, daysOpen };
}

export function enrichPPM(r: MonthlyPPM) {
  const ppm = r.qty_received > 0 ? (r.qty_rejected / r.qty_received) * 1e6 : 0;
  const status = ppm <= r.target_ppm ? 'Within Target' : 'Exceeds Target';
  return { ...r, ppm, status, quarter: quarterOf(r.month) };
}

export function enrichOTD(r: DeliveryPerformance) {
  const otd = r.orders_due > 0 ? (r.orders_on_time / r.orders_due) * 100 : 0;
  const status = otd >= r.target_otd ? 'Meets Target' : 'Below Target';
  return { ...r, otd, status, quarter: quarterOf(r.month) };
}

export function enrichAudit(r: SupplierAudit) {
  return { ...r, rating: ratingFromScore(r.score) };
}

export interface DashboardData {
  suppliers: Supplier[];
  technical_reviews: TechnicalReview[];
  quality_complaints: QualityComplaint[];
  monthly_ppm: MonthlyPPM[];
  delivery_performance: DeliveryPerformance[];
  supplier_audits: SupplierAudit[];
  apqp_parts: ApqpPart[];
}

export interface RawScorecardRow {
  id: string;
  name: string;
  criticality: string | null;
  avgPPM: number | null;
  targetPPM: number | null;
  ppmStatus: string;
  avgOTD: number | null;
  targetOTD: number | null;
  otdStatus: string;
  openComplaints: number;
  criticalComplaints: number;
  avgAuditScore: number | null;
  auditRating: Rating;
  reviewsOnTimePct: number | null;
  apqpSummary: string;
  overallScore: number | null;
  overallRating: Rating;
}

// Ported 1:1 from the prototype's buildScorecard — the weighted overall-score
// formula and per-component statuses are final/intended logic per the handoff.
export function buildScorecard(suppliers: Supplier[], data: DashboardData): RawScorecardRow[] {
  return suppliers.map((s) => {
    const ppmEntries = data.monthly_ppm.filter((r) => r.supplier_id === s.id);
    const sumRec = ppmEntries.reduce((a, r) => a + (r.qty_received || 0), 0);
    const sumRej = ppmEntries.reduce((a, r) => a + (r.qty_rejected || 0), 0);
    const avgPPM = ppmEntries.length ? (sumRec > 0 ? (sumRej / sumRec) * 1e6 : 0) : null;
    const targetPPM = ppmEntries.length
      ? ppmEntries.reduce((a, r) => a + (r.target_ppm || 0), 0) / ppmEntries.length
      : null;
    const ppmStatus = avgPPM == null ? '—' : avgPPM <= (targetPPM as number) ? 'On Target' : 'Above Target';

    const otdEntries = data.delivery_performance.filter((r) => r.supplier_id === s.id);
    const sumDue = otdEntries.reduce((a, r) => a + (r.orders_due || 0), 0);
    const sumOnTime = otdEntries.reduce((a, r) => a + (r.orders_on_time || 0), 0);
    const avgOTD = otdEntries.length ? (sumDue > 0 ? (sumOnTime / sumDue) * 100 : 0) : null;
    const targetOTD = otdEntries.length
      ? otdEntries.reduce((a, r) => a + (r.target_otd || 0), 0) / otdEntries.length
      : null;
    const otdStatus = avgOTD == null ? '—' : avgOTD >= (targetOTD as number) ? 'On Target' : 'Below Target';

    const complaints = data.quality_complaints.filter((r) => r.supplier_id === s.id);
    const openComplaints = complaints.filter((c) => c.status !== 'Closed').length;
    const criticalComplaints = complaints.filter((c) => c.severity === 'Critical').length;

    const audits = data.supplier_audits.filter((r) => r.supplier_id === s.id);
    const avgAuditScore = audits.length ? audits.reduce((a, r) => a + (r.score || 0), 0) / audits.length : null;
    const auditRating = ratingFromScore(avgAuditScore);

    const reviews = data.technical_reviews.filter((r) => r.supplier_id === s.id);
    const closedOrOverdue = reviews.filter((r) => r.status === 'Closed' || r.status === 'Overdue');
    const onTimeReviews = reviews.filter(
      (r) => r.status === 'Closed' && r.actual_closure && r.target_closure && r.actual_closure <= r.target_closure
    ).length;
    const reviewsOnTimePct = closedOrOverdue.length ? (onTimeReviews / closedOrOverdue.length) * 100 : null;

    const apqp = data.apqp_parts.filter(
      (r) => (r.supplier_name || '').trim().toLowerCase() === (s.name || '').trim().toLowerCase()
    );
    const apqpAtRisk = apqp.filter((p) => p.status === 'At Risk' || p.status === 'Delayed').length;
    const apqpComplete = apqp.filter((p) => p.status === 'Complete').length;
    let apqpSummary = '—';
    if (apqp.length) {
      apqpSummary =
        apqpAtRisk > 0 ? `${apqpAtRisk} At Risk` : apqpComplete === apqp.length ? 'All Complete' : `${apqpComplete}/${apqp.length} Complete`;
    }

    const subs: { w: number; v: number }[] = [];
    if (avgPPM != null && targetPPM) {
      subs.push({ w: 0.3, v: Math.max(0, Math.min(100, 100 - Math.max(0, ((avgPPM - targetPPM) / targetPPM) * 100))) });
    }
    if (avgOTD != null && targetOTD) {
      subs.push({ w: 0.25, v: Math.max(0, Math.min(100, (avgOTD / targetOTD) * 100)) });
    }
    subs.push({ w: 0.15, v: Math.max(0, 100 - criticalComplaints * 25 - openComplaints * 10) });
    if (avgAuditScore != null) subs.push({ w: 0.2, v: avgAuditScore });
    if (reviewsOnTimePct != null) subs.push({ w: 0.1, v: reviewsOnTimePct });
    const totalW = subs.reduce((a, x) => a + x.w, 0);
    const overallScore = totalW > 0 ? subs.reduce((a, x) => a + x.v * x.w, 0) / totalW : null;
    const overallRating = ratingFromScore(overallScore);

    return {
      id: s.id,
      name: s.name,
      criticality: s.criticality,
      avgPPM,
      targetPPM,
      ppmStatus,
      avgOTD,
      targetOTD,
      otdStatus,
      openComplaints,
      criticalComplaints,
      avgAuditScore,
      auditRating,
      reviewsOnTimePct,
      apqpSummary,
      overallScore,
      overallRating,
    };
  });
}

export interface ScorecardDisplayRow {
  id: string;
  name: string;
  criticality: string;
  avgPPM: string;
  targetPPM: string;
  ppmStatus: string;
  ppmStatusColor: string;
  avgOTD: string;
  targetOTD: string;
  otdStatus: string;
  otdStatusColor: string;
  openComplaints: number;
  criticalComplaints: number;
  criticalColor: string;
  auditScore: string;
  auditRating: Rating;
  auditRatingColor: string;
  reviewsOnTime: string;
  apqpSummary: string;
  overallScore: string;
  overallRating: Rating;
  ratingColor: string;
}

export function scorecardToDisplay(row: RawScorecardRow): ScorecardDisplayRow {
  return {
    id: row.id,
    name: row.name,
    criticality: row.criticality || '—',
    avgPPM: row.avgPPM == null ? '—' : Math.round(row.avgPPM).toLocaleString(),
    targetPPM: row.targetPPM == null ? '—' : Math.round(row.targetPPM).toLocaleString(),
    ppmStatus: row.ppmStatus,
    ppmStatusColor: row.ppmStatus === 'Above Target' ? '#c23b3b' : row.ppmStatus === 'On Target' ? '#1f8a5c' : '#6b7280',
    avgOTD: row.avgOTD == null ? '—' : row.avgOTD.toFixed(1) + '%',
    targetOTD: row.targetOTD == null ? '—' : row.targetOTD.toFixed(1) + '%',
    otdStatus: row.otdStatus,
    otdStatusColor: row.otdStatus === 'Below Target' ? '#c23b3b' : row.otdStatus === 'On Target' ? '#1f8a5c' : '#6b7280',
    openComplaints: row.openComplaints,
    criticalComplaints: row.criticalComplaints,
    criticalColor: row.criticalComplaints > 0 ? '#c23b3b' : '#1c2230',
    auditScore: row.avgAuditScore == null ? '—' : row.avgAuditScore.toFixed(0) + '%',
    auditRating: row.auditRating,
    auditRatingColor: ratingColor(row.auditRating),
    reviewsOnTime: row.reviewsOnTimePct == null ? '—' : row.reviewsOnTimePct.toFixed(0) + '%',
    apqpSummary: row.apqpSummary,
    overallScore: row.overallScore == null ? '—' : row.overallScore.toFixed(1),
    overallRating: row.overallRating,
    ratingColor: ratingColor(row.overallRating),
  };
}

export interface PortfolioSummary {
  count: number;
  ratedA: number;
  ratedD: number;
  avgPPM: string;
  avgOTD: string;
}

export function buildPortfolioSummary(rawScorecard: RawScorecardRow[]): PortfolioSummary {
  const n = rawScorecard.length;
  const ratedA = rawScorecard.filter((s) => s.overallRating === 'A').length;
  const ratedD = rawScorecard.filter((s) => s.overallRating === 'D').length;
  const ppmVals = rawScorecard.filter((s) => s.avgPPM != null);
  const avgPPM = ppmVals.length ? ppmVals.reduce((a, s) => a + (s.avgPPM as number), 0) / ppmVals.length : null;
  const otdVals = rawScorecard.filter((s) => s.avgOTD != null);
  const avgOTD = otdVals.length ? otdVals.reduce((a, s) => a + (s.avgOTD as number), 0) / otdVals.length : null;
  return {
    count: n,
    ratedA,
    ratedD,
    avgPPM: avgPPM == null ? '—' : Math.round(avgPPM).toLocaleString(),
    avgOTD: avgOTD == null ? '—' : avgOTD.toFixed(1) + '%',
  };
}

export function getAvailableMonths(data: DashboardData): string[] {
  const set = new Set<string>();
  data.monthly_ppm.forEach((r) => r.month && set.add(r.month));
  data.delivery_performance.forEach((r) => r.month && set.add(r.month));
  return Array.from(set).sort();
}

export type ReportSlide =
  | { kind: 'title'; monthLabel: string }
  | {
      kind: 'summary';
      monthLabel: string;
      supplierCount: number;
      portfolioPPM: string;
      portfolioOTD: string;
      complaintsCount: number;
      criticalCount: number;
      auditsCount: number;
    }
  | {
      kind: 'scorecardChart';
      monthLabel: string;
      bars: { name: string; widthPctStr: string; scoreDisplay: string; ratingColor: string }[];
    }
  | {
      kind: 'supplier';
      supplierName: string;
      criticality: string;
      ppm: string;
      ppmTarget: string | number;
      otd: string;
      otdTarget: string | number;
      complaintsCount: number;
      auditsCount: number;
      apqpSummary: string;
      overallScore: string;
      overallRating: Rating;
      ppmActualPctStr: string;
      ppmTargetPctStr: string;
      otdActualPctStr: string;
      otdTargetPctStr: string;
    }
  | { kind: 'closing' };

// Ported 1:1 from the prototype's buildReportSlides.
export function buildReportSlides(month: string, suppliers: Supplier[], data: DashboardData): ReportSlide[] {
  if (!month) return [];
  const monthPPM = data.monthly_ppm.filter((r) => r.month === month);
  const monthOTD = data.delivery_performance.filter((r) => r.month === month);
  const monthComplaints = data.quality_complaints.filter((r) => (r.date_raised || '').slice(0, 7) === month);
  const monthAudits = data.supplier_audits.filter((r) => (r.actual_date || r.planned_date || '').slice(0, 7) === month);
  const rawScorecard = buildScorecard(suppliers, data);
  const monthLabel = fmtMonth(month);

  const sumRec = monthPPM.reduce((a, r) => a + (r.qty_received || 0), 0);
  const sumRej = monthPPM.reduce((a, r) => a + (r.qty_rejected || 0), 0);
  const portfolioPPM = sumRec > 0 ? Math.round((sumRej / sumRec) * 1e6).toLocaleString() : '—';
  const sumDue = monthOTD.reduce((a, r) => a + (r.orders_due || 0), 0);
  const sumOnTime = monthOTD.reduce((a, r) => a + (r.orders_on_time || 0), 0);
  const portfolioOTD = sumDue > 0 ? ((sumOnTime / sumDue) * 100).toFixed(1) + '%' : '—';

  const slides: ReportSlide[] = [];
  slides.push({ kind: 'title', monthLabel });
  slides.push({
    kind: 'summary',
    monthLabel,
    supplierCount: suppliers.length,
    portfolioPPM,
    portfolioOTD,
    complaintsCount: monthComplaints.length,
    criticalCount: monthComplaints.filter((c) => c.severity === 'Critical').length,
    auditsCount: monthAudits.length,
  });

  const bars = rawScorecard.map((sc) => {
    const v = sc.overallScore == null ? 0 : Math.max(2, Math.round(sc.overallScore));
    return {
      name: sc.name,
      widthPctStr: v + '%',
      scoreDisplay: sc.overallScore == null ? '—' : sc.overallScore.toFixed(1),
      ratingColor: ratingColor(sc.overallRating),
    };
  });
  slides.push({ kind: 'scorecardChart', monthLabel, bars });

  suppliers.forEach((s) => {
    const ppm = monthPPM.find((r) => r.supplier_id === s.id);
    const otd = monthOTD.find((r) => r.supplier_id === s.id);
    const complaints = monthComplaints.filter((r) => r.supplier_id === s.id);
    const audits = monthAudits.filter((r) => r.supplier_id === s.id);
    const sc = rawScorecard.find((x) => x.id === s.id);

    const ppmNum = ppm ? (ppm.qty_received > 0 ? (ppm.qty_rejected / ppm.qty_received) * 1e6 : 0) : null;
    const ppmTargetNum = ppm ? ppm.target_ppm : null;
    const ppmMax = Math.max(ppmNum || 0, ppmTargetNum || 0, 1);
    const otdNum = otd ? (otd.orders_due > 0 ? (otd.orders_on_time / otd.orders_due) * 100 : 0) : null;
    const otdTargetNum = otd ? otd.target_otd : null;

    slides.push({
      kind: 'supplier',
      supplierName: s.name,
      criticality: s.criticality || '—',
      ppm: ppmNum != null ? Math.round(ppmNum).toLocaleString() : '—',
      ppmTarget: ppmTargetNum != null ? ppmTargetNum : '—',
      otd: otdNum != null ? otdNum.toFixed(1) + '%' : '—',
      otdTarget: otdTargetNum != null ? otdTargetNum + '%' : '—',
      complaintsCount: complaints.length,
      auditsCount: audits.length,
      apqpSummary: sc ? sc.apqpSummary : '—',
      overallScore: sc && sc.overallScore != null ? sc.overallScore.toFixed(1) : '—',
      overallRating: sc ? sc.overallRating : '—',
      ppmActualPctStr: ppmNum != null ? Math.max(2, Math.round((ppmNum / ppmMax) * 100)) + '%' : '0%',
      ppmTargetPctStr: ppmTargetNum != null ? Math.max(2, Math.round((ppmTargetNum / ppmMax) * 100)) + '%' : '0%',
      otdActualPctStr: otdNum != null ? Math.max(2, Math.min(100, Math.round(otdNum))) + '%' : '0%',
      otdTargetPctStr: otdTargetNum != null ? Math.max(2, Math.min(100, Math.round(otdTargetNum))) + '%' : '0%',
    });
  });
  slides.push({ kind: 'closing' });
  return slides;
}
