import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { MolstarViewer, MolstarViewerRef } from '@/components/MolstarViewer';
import { AssayTable } from '@/components/AssayTable';
import { StatsPanel } from '@/components/StatsPanel';
import { ToxicityPieChart } from '@/components/ToxicityPieChart';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AssayData {
  compoundId: string;
  ic50: number;
  toxicity: 'Low' | 'Moderate' | 'High';
}

const Index = () => {
  const [assayData, setAssayData] = useState<AssayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToxicity, setSelectedToxicity] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [selectedProtein, setSelectedProtein] = useState<string>('6LU7');
  const viewerRef = useRef<MolstarViewerRef>(null);

  useEffect(() => {
    const loadCSV = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/data/assay_${selectedProtein}.csv`);
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
  }, [selectedProtein]);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Molecular Assay Explorer
              </h1>
              <p className="text-muted-foreground mt-2">
                Interactive visualization of compound assay data and molecular structures
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Protein:</span>
              <Select value={selectedProtein} onValueChange={setSelectedProtein}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6LU7">6LU7 (SARS-CoV-2)</SelectItem>
                  <SelectItem value="1HSG">1HSG (HIV Protease)</SelectItem>
                  <SelectItem value="4YTH">4YTH (Kinase)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 h-[calc(100vh-140px)]">
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
          {/* Left Panel - Molecular Viewer */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ScrollArea className="h-full">
              <div className="p-4">
                <MolstarViewer ref={viewerRef} toxicity={selectedToxicity} selectedProtein={selectedProtein} />
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Data Panels */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <AssayTable 
                  data={assayData}
                  onRowClick={(row) => {
                    setSelectedToxicity(row.toxicity);
                    viewerRef.current?.focusLigand(row.compoundId);
                  }}
                />
                <StatsPanel data={assayData} />
                <ToxicityPieChart data={assayData} />
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;
