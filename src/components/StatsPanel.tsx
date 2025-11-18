import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';

interface AssayData {
  compoundId: string;
  ic50: number;
  toxicity: 'Low' | 'Moderate' | 'High';
}

interface StatsPanelProps {
  data: AssayData[];
}

const getToxicityColor = (toxicity: string) => {
  switch (toxicity) {
    case 'Low':
      return 'hsl(var(--toxicity-low))';
    case 'Moderate':
      return 'hsl(var(--toxicity-moderate))';
    case 'High':
      return 'hsl(var(--toxicity-high))';
    default:
      return 'hsl(var(--muted))';
  }
};

export const StatsPanel = ({ data }: StatsPanelProps) => {
  const chartData = data.map(item => ({
    name: item.compoundId,
    ic50: item.ic50,
    toxicity: item.toxicity,
  }));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">IC50 Distribution</h2>
        <p className="text-sm text-muted-foreground mt-1">Lower IC50 values indicate higher potency</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'IC50 (nM)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Bar dataKey="ic50" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getToxicityColor(entry.toxicity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
