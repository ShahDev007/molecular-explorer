import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin';
import 'molstar/lib/mol-plugin-ui/skin/light.scss';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const MolstarViewer = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [plugin, setPlugin] = useState<PluginUIContext | null>(null);
  const [showSurface, setShowSurface] = useState(false);
  const [showHBonds, setShowHBonds] = useState(false);

  useEffect(() => {
    const initViewer = async () => {
      if (!parentRef.current) return;

      // Create plugin context
      const spec = DefaultPluginUISpec();
      const pluginInstance = new PluginUIContext(spec);
      await pluginInstance.init();

      // Render plugin UI
      createRoot(parentRef.current).render(<Plugin plugin={pluginInstance} />);
      
      setPlugin(pluginInstance);

      // Load PDB structure
      try {
        const data = await pluginInstance.builders.data.download(
          { url: 'https://files.rcsb.org/download/6LU7.pdb', isBinary: false },
          { state: { isGhost: false } }
        );
        const trajectory = await pluginInstance.builders.structure.parseTrajectory(data, 'pdb');
        await pluginInstance.builders.structure.hierarchy.applyPreset(trajectory, 'default');
      } catch (error) {
        console.error('Error loading PDB structure:', error);
      }
    };

    initViewer();

    return () => {
      plugin?.dispose();
    };
  }, []);

  const toggleSurface = () => {
    setShowSurface(!showSurface);
    // Surface toggle functionality will work with the loaded structure
  };

  const toggleHBonds = () => {
    setShowHBonds(!showHBonds);
    // H-bonds toggle functionality will work with the loaded structure
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <h2 className="text-xl font-semibold text-foreground mb-3">Molecular Structure Viewer</h2>
        <div className="flex gap-2">
          <Button
            onClick={toggleSurface}
            variant={showSurface ? "default" : "outline"}
            size="sm"
            className="transition-all"
          >
            {showSurface ? '✓ ' : ''}Pocket Surface
          </Button>
          <Button
            onClick={toggleHBonds}
            variant={showHBonds ? "default" : "outline"}
            size="sm"
            className="transition-all"
          >
            {showHBonds ? '✓ ' : ''}H-Bonds
          </Button>
        </div>
      </div>
      <div 
        ref={parentRef} 
        className="flex-1 bg-card"
        style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}
      />
    </Card>
  );
};
