import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function formatRupees(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
  try {
    return `₹${value.toLocaleString('en-IN')}`;
  } catch (e) {
    return `₹${value}`;
  }
}

export default function IncomeChart({ itrDetails = {}, title = "Income History (from ITR)", height = 300 }) {
  const labels = Array.isArray(itrDetails.labels) ? itrDetails.labels : [];
  const values = Array.isArray(itrDetails.income) ? itrDetails.income : [];

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Declared Income',
        data: values,
        backgroundColor: '#60a5fa',
        borderRadius: 6,
        maxBarThickness: 48,
      },
    ],
  }), [labels, values]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          label: (ctx) => formatRupees(ctx.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#334155' },
      },
      y: {
        grid: { color: 'rgba(15,23,42,0.06)' },
        ticks: {
          color: '#334155',
          callback: (v) => formatRupees(v),
        },
      },
    },
  }), [title]);

  if (!labels.length || !values.length) {
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
        No ITR data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, background: '#fff', borderRadius: 12, border: '1px solid rgba(15,23,42,0.06)' }}>
      <Bar data={data} options={options} />
    </div>
  );
}


