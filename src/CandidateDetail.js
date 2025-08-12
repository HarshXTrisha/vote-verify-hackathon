import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './App.css';
import AssetChart from './AssetChart';
import IncomeChart from './IncomeChart';
import { useTranslation } from 'react-i18next';
import { nameMapHiById } from './nameMapHi';

// Helper function to format numbers into the Indian Rupee system (e.g., 1,00,000)
const formatRupees = (value) => value ? `₹${value.toLocaleString('en-IN')}` : 'N/A';

function CandidateDetail({ candidates, stats }) {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const candidate = candidates.find(c => c.id === parseInt(id));
  const partyClass = (candidate?.party || '').toLowerCase().includes('congress') ? 'inc' :
                     (candidate?.party || '').toLowerCase().includes('bjp') ? 'bjp' : '';
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  const displayName = i18n.language === 'hi' ? (nameMapHiById[candidate.id] || candidate.name) : candidate.name;

  const shareProfileToWhatsApp = () => {
    const assets = candidate.assets_inr ? candidate.assets_inr.toLocaleString('en-IN') : '—';
    const liabilities = candidate.liabilities_inr ? candidate.liabilities_inr.toLocaleString('en-IN') : '—';
    const cases = candidate.criminal_cases ?? '—';
    const message = `Check out the profile of ${displayName} on Jan Saarthi. Declared Assets: ₹${assets}, Liabilities: ₹${liabilities}, Criminal Cases: ${cases}. See all the details here: https://vote-verify-hackathon.vercel.app/ - Shared by harshvardhan singh`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="App">
      <div className="detail-card">
        <Link to="/" className="back-link">{t('back_to_all_candidates')}</Link>

        <div className="detail-hero">
          <img className="detail-photo" src={candidate.photo_url} alt={candidate.name} />
          <div className="detail-title">
            <h1 className="detail-name-hero">{displayName}</h1>
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
            <p><strong>{t('assets')}:</strong> {formatRupees(candidate.assets_inr)}</p>
            <p><strong>{t('liabilities')}:</strong> {formatRupees(candidate.liabilities_inr)}</p>
            <p><strong>{t('criminal_cases')}:</strong> {candidate.criminal_cases}</p>
            <p><strong>{t('education')}:</strong> {candidate.education}</p>
            {candidate.profession && (
              <p><strong>Profession:</strong> {candidate.profession}</p>
            )}
          </div>

          <div className="detail-section">
            <h2 className="section-title">{t('movable_assets')}</h2>
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
            <h2 className="section-title">{t('immovable_assets')}</h2>
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
                <button className="btn" onClick={() => setIsCaseModalOpen(true)}>{t('view_details')}</button>
              </div>
            ) : <p>No criminal cases reported.</p>}
          </div>
        </div>
        
        <div className="charts-container">
          <AssetChart assets={candidate.movable_assets || {}} title="Movable Assets Breakdown" height={300} />
          <AssetChart assets={candidate.immovable_assets || {}} title="Immovable Assets Breakdown" height={300} />
        </div>

        <div className="detail-section" style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <h2 className="section-title" style={{ marginRight: 'auto' }}>Income History (from ITR)</h2>
          <a href={candidate.myneta_url} target="_blank" rel="noopener noreferrer" className="btn affidavit-button">
            View Official Affidavit on MyNeta
          </a>
          <button type="button" className="btn whatsapp" onClick={shareProfileToWhatsApp}>
            <span className="wa-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                <path d="M19.11 17.27c-.28-.14-1.64-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.08-.17.19-.35.21-.64.07-.28-.14-1.19-.44-2.26-1.4-.84-.75-1.4-1.68-1.57-1.96-.16-.28-.02-.43.12-.57.12-.12.28-.3.42-.45.14-.16.19-.26.28-.43.09-.17.05-.32-.02-.45-.07-.14-.64-1.54-.88-2.11-.23-.55-.46-.48-.64-.49-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.77.35-.26.28-1 1-1 2.43 0 1.43 1.03 2.82 1.17 3 .14.19 2.03 3.1 4.92 4.28.69.3 1.24.48 1.67.61.7.22 1.34.19 1.85.11.56-.08 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.07-.11-.26-.18-.54-.32zM26.76 5.24C23.82 2.31 20.03.75 16 .75 7.32.75.25 7.83.25 16.5c0 2.84.74 5.61 2.14 8.06L.76 31.25l6.89-1.58c2.39 1.31 5.1 2 7.85 2h.01c8.67 0 15.75-7.08 15.75-15.75 0-3.98-1.55-7.73-4.5-10.68zM16.5 29.18h-.01c-2.45 0-4.85-.66-6.94-1.92l-.5-.3-4.09.94.87-3.98-.33-.51c-1.33-2.13-2.03-4.6-2.03-7.07 0-7.42 6.04-13.46 13.46-13.46 3.59 0 6.97 1.4 9.51 3.95 2.54 2.54 3.95 5.92 3.95 9.51 0 7.42-6.04 13.46-13.46 13.46z" />
              </svg>
            </span>
            Share Profile
          </button>
        </div>
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


