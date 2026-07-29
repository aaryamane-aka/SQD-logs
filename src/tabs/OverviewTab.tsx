import { buildPortfolioSummary, buildScorecard, scorecardToDisplay, type DashboardData } from '../lib/compute';
import type { Supplier } from '../lib/types';

interface Props {
  data: DashboardData;
  suppliers: Supplier[];
}

export function OverviewTab({ data, suppliers }: Props) {
  const raw = buildScorecard(suppliers, data);
  const scorecard = raw.map(scorecardToDisplay);
  const portfolio = buildPortfolioSummary(raw);

  if (scorecard.length === 0) {
    return (
      <div>
        <div className="main-header">
          <div className="main-title">Overview</div>
        </div>
        <div className="empty-state large">
          <div className="title">No suppliers yet</div>
          <div>Go to the Suppliers tab to add your first supplier and start tracking quality data.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="main-header">
        <div className="main-title">Overview</div>
      </div>

      <div className="stat-grid">
        <div className="card">
          <div className="stat-label">Suppliers Tracked</div>
          <div className="stat-value">{portfolio.count}</div>
        </div>
        <div className="card">
          <div className="stat-label">Rated A</div>
          <div className="stat-value" style={{ color: '#1f8a5c' }}>
            {portfolio.ratedA}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Rated D (At Risk)</div>
          <div className="stat-value" style={{ color: '#c23b3b' }}>
            {portfolio.ratedD}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Avg PPM</div>
          <div className="stat-value">{portfolio.avgPPM}</div>
        </div>
        <div className="card">
          <div className="stat-label">Avg OTD %</div>
          <div className="stat-value">{portfolio.avgOTD}</div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Crit.</th>
              <th>Avg PPM</th>
              <th>Target</th>
              <th>PPM Status</th>
              <th>Avg OTD</th>
              <th>Target</th>
              <th>OTD Status</th>
              <th>Open Compl.</th>
              <th>Critical</th>
              <th>Audit Score</th>
              <th>Audit Rtg</th>
              <th>Reviews On-Time</th>
              <th>APQP Status</th>
              <th>Overall Score</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.map((row) => (
              <tr key={row.id}>
                <td style={{ fontWeight: 600 }}>{row.name}</td>
                <td>{row.criticality}</td>
                <td className="mono">{row.avgPPM}</td>
                <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                  {row.targetPPM}
                </td>
                <td style={{ fontWeight: 600, color: row.ppmStatusColor }}>{row.ppmStatus}</td>
                <td className="mono">{row.avgOTD}</td>
                <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                  {row.targetOTD}
                </td>
                <td style={{ fontWeight: 600, color: row.otdStatusColor }}>{row.otdStatus}</td>
                <td>{row.openComplaints}</td>
                <td style={{ fontWeight: 600, color: row.criticalColor }}>{row.criticalComplaints}</td>
                <td>{row.auditScore}</td>
                <td style={{ fontWeight: 700, color: row.auditRatingColor }}>{row.auditRating}</td>
                <td>{row.reviewsOnTime}</td>
                <td>{row.apqpSummary}</td>
                <td className="mono" style={{ fontWeight: 600 }}>
                  {row.overallScore}
                </td>
                <td style={{ fontWeight: 700, color: row.ratingColor }}>{row.overallRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
