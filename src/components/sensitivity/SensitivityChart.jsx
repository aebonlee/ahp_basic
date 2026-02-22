import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LEVEL_COLORS } from '../../lib/constants';

export default function SensitivityChart({ data, alternatives, criterionName }) {
  if (!data || !alternatives) return null;

  const chartData = data.map(d => {
    const point = { weight: (d.weight * 100).toFixed(0) + '%' };
    alternatives.forEach((alt, i) => {
      point[alt.name] = (d.scores[i] * 100);
    });
    return point;
  });

  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: 8, padding: 24, boxShadow: 'var(--shadow-sm)', marginTop: 16 }}>
      <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>
        {criterionName} 가중치 변화에 따른 대안 순위
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis dataKey="weight" interval={9} />
          <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} />
          <Tooltip formatter={(v) => `${v.toFixed(2)}%`} />
          <Legend />
          {alternatives.map((alt, i) => (
            <Line
              key={alt.id}
              type="monotone"
              dataKey={alt.name}
              stroke={LEVEL_COLORS[i % LEVEL_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
