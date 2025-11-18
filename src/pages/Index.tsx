import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { MolstarViewer } from '@/components/MolstarViewer';
import { AssayTable } from '@/components/AssayTable';
import { StatsPanel } from '@/components/StatsPanel';
import { ToxicityPieChart } from '@/components/ToxicityPieChart';
import { Loader2 } from 'lucide-react';

interface AssayData {
  compoundId: string;
  ic50: number;
  toxicity: 'Low' | 'Moderate' | 'High';
}

const Index = () => {
  const [assayData, setAssayData] = useState<AssayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('/data/sample_assay.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.map((row: any) => ({
              compoundId: row['Compound ID'],
              ic50: parseFloat(row['IC50 (nM)']),
              toxicity: row['Toxicity'] as 'Low' | 'Moderate' | 'High',
            }));
            setAssayData(parsed);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('Error loading CSV:', error);
        setLoading(false);
      }
    };

    loadCSV();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading molecular data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Molecular Assay Explorer
          </h1>
          <p className="text-muted-foreground mt-2">
            Interactive visualization of compound assay data and molecular structures
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Molecular Viewer */}
          <div className="lg:col-span-1">
            <MolstarViewer />
          </div>

          {/* Right Column - Data Panels */}
          <div className="lg:col-span-1 space-y-6">
            <AssayTable data={assayData} />
            <StatsPanel data={assayData} />
            <ToxicityPieChart data={assayData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
