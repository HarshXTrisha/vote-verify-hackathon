import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from './contexts/LanguageContext';
import { getTranslation } from './translations';
import { useTranslation } from 'react-i18next';
import { nameMapHiById } from './nameMapHi';
import './App.css';

function formatCurrencyINR(value) {
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
  } catch (e) {
    return value;
  }
}

function CandidateCard({ candidate, onQuickSummary, onToggleCompare, isCompared, stats }) {
  const { language } = useLanguage();
  const { i18n } = useTranslation();
  const displayName = i18n.language === 'hi' ? (nameMapHiById[candidate.id] || candidate.name) : candidate.name;
  const assetsFormatted = `₹${formatCurrencyINR(candidate.assets_inr)}`;
  const liabilitiesFormatted = `₹${formatCurrencyINR(candidate.liabilities_inr)}`;
  const hasCriminalCases = Number(candidate.criminal_cases) > 0;
  const partyClass = (candidate.party || '').toLowerCase().includes('congress') ? 'inc' :
                     (candidate.party || '').toLowerCase().includes('bjp') ? 'bjp' : '';
  const badges = [];
  if (stats && Number(candidate.assets_inr) > 2 * stats.averageAssets) {
    badges.push({ label: getTranslation(language, 'highAssets'), type: 'asset' });
  }
  if (Number(candidate.criminal_cases) > 2) {
    badges.push({ label: getTranslation(language, 'highCriminalCaseCount'), type: 'case' });
  }

  return (
    <div className="candidate-card">
      <Link
        to={`/candidate/${candidate.id}`}
        className="card-link-area"
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div className="card-header">
          <img className="candidate-photo" src={candidate.photo_url} alt={candidate.name} />
          <div>
            <div className="title-row">
              <h3 className="candidate-name">{displayName}</h3>
              <span className={`party-badge ${partyClass}`}>{candidate.party}</span>
            </div>
            <p className="constituency">{candidate.constituency}</p>
          </div>
        </div>

        <div className="candidate-stats">
          {badges.length > 0 && (
            <div className="badge-row">
              {badges.map((b, i) => (
                <span key={i} className={`insight-badge ${b.type}`}>{b.label}</span>
              ))}
            </div>
          )}
          <div className="stat-pill">
            <span className="stat-label">{getTranslation(language, 'assets')}</span>
            <span className="stat-value">{assetsFormatted}</span>
          </div>
          <div className={`stat-pill ${hasCriminalCases ? 'danger' : 'success'}`}>
            <span className="stat-label">{getTranslation(language, 'criminalCases')}</span>
            <span className="stat-value">
              {hasCriminalCases ? (
                <FaExclamationTriangle className="icon danger" aria-label="Has criminal cases" title="Has criminal cases" />
              ) : (
                <FaCheckCircle className="icon success" aria-label="No criminal cases" title="No criminal cases" />
              )}
              {candidate.criminal_cases}
            </span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">{getTranslation(language, 'liabilities')}</span>
            <span className="stat-value">{liabilitiesFormatted}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">{getTranslation(language, 'education')}</span>
            <span className="stat-value">{candidate.education || getTranslation(language, 'dash')}</span>
          </div>
        </div>
      </Link>

      <div className="card-actions">
        {candidate.myneta_url && (
          <a className="btn" href={candidate.myneta_url} target="_blank" rel="noopener noreferrer">
            {getTranslation(language, 'viewAffidavit')}
          </a>
        )}
        {candidate.plainLanguageSummary && (
          <button className="btn primary" onClick={() => onQuickSummary && onQuickSummary(candidate)}>
            {getTranslation(language, 'quickSummary')}
          </button>
        )}
        <label className="compare-check">
          <input
            type="checkbox"
            checked={!!isCompared}
            onChange={() => onToggleCompare && onToggleCompare(candidate)}
          />
          {getTranslation(language, 'compare')}
        </label>
      </div>
    </div>
  );
}

export default CandidateCard;