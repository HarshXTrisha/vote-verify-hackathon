import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './App.css';
import AssetChart from './AssetChart';
import IncomeChart from './IncomeChart';

// Helper function to format numbers into the Indian Rupee system (e.g., 1,00,000)
const formatRupees = (value) => value ? `₹${value.toLocaleString('en-IN')}` : 'N/A';

function CandidateDetail({ candidates, stats }) {
  const { id } = useParams();
  const candidate = candidates.find(c => c.id === parseInt(id));
  const partyClass = (candidate?.party || '').toLowerCase().includes('congress') ? 'inc' :
                     (candidate?.party || '').toLowerCase().includes('bjp') ? 'bjp' : '';
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  return (
    <div className="App">
      <div className="detail-card">
        <Link to="/" className="back-link">← Back to all candidates</Link>

        <div className="detail-hero">
          <img className="detail-photo" src={candidate.photo_url} alt={candidate.name} />
          <div className="detail-title">
            <h1 className="detail-name-hero">{candidate.name}</h1>
            <div className="detail-sub-row">
              <span className={`party-chip ${partyClass}`}>{candidate.party}</span>
              {candidate.constituency && (
                <span className="constituency-chip">{candidate.constituency}</span>
              )}
            </div>
            {candidate.plainLanguageSummary && (
              <p className="summary">{candidate.plainLanguageSummary}</p>
            )}
          </div>
        </div>
        
        <div className="grid-container">
          <div className="detail-section">
            <h2 className="section-title">Overview</h2>
            <div className="badge-row">
              {stats && Number(candidate.assets_inr) > 2 * stats.averageAssets && (
                <span className="insight-badge asset">High Assets</span>
              )}
              {Number(candidate.criminal_cases) > 2 && (
                <span className="insight-badge case">High Criminal Case Count</span>
              )}
            </div>
            <p><strong>Assets:</strong> {formatRupees(candidate.assets_inr)}</p>
            <p><strong>Liabilities:</strong> {formatRupees(candidate.liabilities_inr)}</p>
            <p><strong>Criminal cases:</strong> {candidate.criminal_cases}</p>
            <p><strong>Education:</strong> {candidate.education}</p>
            {candidate.profession && (
              <p><strong>Profession:</strong> {candidate.profession}</p>
            )}
          </div>

          <div className="detail-section">
            <h2 className="section-title">Movable Assets</h2>
            {candidate.movable_assets ? (
              <>
                <p><strong>Cash:</strong> {formatRupees(candidate.movable_assets.cash)}</p>
                <p><strong>Bank Deposits:</strong> {formatRupees(candidate.movable_assets.bank_deposits)}</p>
                <p><strong>Bonds/Shares:</strong> {formatRupees(candidate.movable_assets.bonds_shares)}</p>
                <p><strong>Vehicles:</strong> {formatRupees(candidate.movable_assets.vehicles)}</p>
                <p><strong>Jewellery:</strong> {formatRupees(candidate.movable_assets.jewellery)}</p>
              </>
            ) : <p>Data not available.</p>}
          </div>

          <div className="detail-section">
            <h2 className="section-title">Immovable Assets</h2>
            {candidate.immovable_assets ? (
              <>
                <p><strong>Agricultural Land:</strong> {formatRupees(candidate.immovable_assets.agricultural_land)}</p>
                <p><strong>Non-Agricultural Land:</strong> {formatRupees(candidate.immovable_assets.non_agricultural_land)}</p>
                <p><strong>Commercial Buildings:</strong> {formatRupees(candidate.immovable_assets.commercial_buildings)}</p>
                <p><strong>Residential Buildings:</strong> {formatRupees(candidate.immovable_assets.residential_buildings)}</p>
              </>
            ) : <p>Data not available.</p>}
          </div>

          <div className="detail-section">
            <h2 className="section-title">Criminal Case Details</h2>
            {candidate.criminal_cases > 0 ? (
              <div>
                <p style={{ margin: '0 0 8px 0' }}>{candidate.criminal_cases} cases reported.</p>
                <button className="btn" onClick={() => setIsCaseModalOpen(true)}>View Details</button>
              </div>
            ) : <p>No criminal cases reported.</p>}
          </div>
        </div>
        
        <div className="charts-container">
          <AssetChart assets={candidate.movable_assets || {}} title="Movable Assets Breakdown" height={300} />
          <AssetChart assets={candidate.immovable_assets || {}} title="Immovable Assets Breakdown" height={300} />
        </div>

        <div className="detail-section" style={{ marginTop: 12 }}>
          <h2 className="section-title">Income History (from ITR)</h2>
          <IncomeChart itrDetails={candidate.itr_details || {}} height={320} />
        </div>

        <a href={candidate.myneta_url} target="_blank" rel="noopener noreferrer" className="affidavit-button">
          View Official Affidavit on MyNeta
        </a>
      </div>

      {isCaseModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-details-title"
          onClick={() => setIsCaseModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="case-details-title" className="modal-title">Criminal Case Details</h3>
            </div>
            <div className="modal-body">
              {Array.isArray(candidate.criminal_case_details) && candidate.criminal_case_details.length > 0 ? (
                <ul className="case-list">
                  {candidate.criminal_case_details.map((item, idx) => (
                    <li key={idx} className="case-item">
                      <div className="case-item-title">Case {item.case_number ?? idx + 1}</div>
                      <div className="case-item-desc">{item.charge || 'Charge details not provided'}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No detailed case information available.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setIsCaseModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateDetail;


