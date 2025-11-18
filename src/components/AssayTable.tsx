import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AssayData {
  compoundId: string;
  ic50: number;
  toxicity: 'Low' | 'Moderate' | 'High';
}

interface AssayTableProps {
  data: AssayData[];
}

const getToxicityColor = (toxicity: string) => {
  switch (toxicity) {
    case 'Low':
      return 'bg-toxicity-low text-white';
    case 'Moderate':
      return 'bg-toxicity-moderate text-white';
    case 'High':
      return 'bg-toxicity-high text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const AssayTable = ({ data }: AssayTableProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <h2 className="text-xl font-semibold text-foreground">Compound Assay Results</h2>
        <p className="text-sm text-muted-foreground mt-1">IC50 values and toxicity levels</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Compound ID</TableHead>
            <TableHead className="font-semibold">IC50 (nM)</TableHead>
            <TableHead className="font-semibold">Toxicity Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.compoundId} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono font-medium">{row.compoundId}</TableCell>
              <TableCell>{row.ic50.toFixed(1)}</TableCell>
              <TableCell>
                <Badge className={getToxicityColor(row.toxicity)}>
                  {row.toxicity}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
