import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface AssayData {
  compoundId: string;
  ic50: number;
  toxicity: 'Low' | 'Moderate' | 'High';
}

interface ToxicityPieChartProps {
  data: AssayData[];
}

const COLORS = {
  Low: 'hsl(var(--toxicity-low))',
  Moderate: 'hsl(var(--toxicity-moderate))',
  High: 'hsl(var(--toxicity-high))',
};

export const ToxicityPieChart = ({ data }: ToxicityPieChartProps) => {
  const toxicityCounts = data.reduce((acc, item) => {
    acc[item.toxicity] = (acc[item.toxicity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(toxicityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Toxicity Distribution</h2>
        <p className="text-sm text-muted-foreground mt-1">Breakdown of compounds by toxicity level</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
