import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function formatRupees(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  try {
    return `₹${value.toLocaleString('en-IN')}`;
  } catch (e) {
    return `₹${value}`;
  }
}

const DEFAULT_COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16',
  '#EC4899', '#14B8A6', '#F97316', '#22C55E', '#3B82F6', '#A855F7', '#0EA5E9',
];

export default function AssetChart({ assets = {}, title = 'Assets Breakdown', height = 260 }) {
  const { labels, values } = useMemo(() => {
    const entries = Object.entries(assets || {})
      .filter(([, v]) => typeof v === 'number' && v > 0);
    return {
      labels: entries.map(([k]) => toTitleCase(k.replace(/_/g, ' '))),
      values: entries.map(([, v]) => v),
    };
  }, [assets]);

  const colors = useMemo(() => {
    if (!values || values.length === 0) return DEFAULT_COLORS;
    const repeats = Math.ceil(values.length / DEFAULT_COLORS.length);
    return Array.from({ length: repeats }).flatMap(() => DEFAULT_COLORS).slice(0, values.length);
  }, [values]);

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }), [labels, values, colors]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 14,
        },
      },
      title: {
        display: Boolean(title),
        text: title,
        color: '#0f172a',
        font: { size: 14, weight: '700' },
        padding: { top: 8, bottom: 8 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.parsed;
            return `${label}: ${formatRupees(value)}`;
          },
        },
      },
    },
  }), [title]);

  if (!labels.length) {
    return (
      <div style={{
        width: '100%',
        minHeight: height,
        border: '1px solid rgba(15,23,42,0.06)',
        borderRadius: 12,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
      }}>
        No asset data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, background: '#fff', borderRadius: 12, border: '1px solid rgba(15,23,42,0.06)' }}>
      <Pie data={data} options={options} />
    </div>
  );
}

function toTitleCase(input) {
  return String(input)
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ');
}


