import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { createRoot } from "react-dom/client";
import { DefaultPluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { Plugin } from "molstar/lib/mol-plugin-ui/plugin";
import { StructureRepresentationPresetProvider } from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import { StateSelection } from "molstar/lib/mol-state";
import { Color } from "molstar/lib/mol-util/color";
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface MolstarViewerRef {
  focusLigand: (ligandId: string) => void;
  setToxicityColor: (toxicity: "Low" | "Moderate" | "High") => void;
}

interface MolstarViewerProps {
  toxicity?: "Low" | "Moderate" | "High";
  selectedProtein: string;
  onProteinChange: (protein: string) => void;
}

export const MolstarViewer = forwardRef<MolstarViewerRef, MolstarViewerProps>(({ toxicity = "Low", selectedProtein, onProteinChange }, ref) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [plugin, setPlugin] = useState<PluginUIContext | null>(null);
  const [showSurface, setShowSurface] = useState(false);
  const [showHBonds, setShowHBonds] = useState(false);
  const [surfaceRef, setSurfaceRef] = useState<any>(null);
  const [hbondsRef, setHbondsRef] = useState<any>(null);
  const [structureRef, setStructureRef] = useState<any>(null);

  // Get color based on toxicity level
  const getToxicityColor = (tox: "Low" | "Moderate" | "High"): Color => {
    switch (tox) {
      case "High":
        return Color.fromRgb(220, 38, 38); // red
      case "Moderate":
        return Color.fromRgb(249, 115, 22); // orange
      case "Low":
        return Color.fromRgb(34, 197, 94); // green
    }
  };

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
    };

    initViewer();

    return () => {
      plugin?.dispose();
    };
  }, []);

  // Load structure when protein selection changes
  useEffect(() => {
    const loadStructure = async () => {
      if (!plugin) return;

      // Clear previous structure
      try {
        await plugin.clear();
      } catch (error) {
        console.error("Error clearing structure:", error);
      }

      // Load new PDB structure
      try {
        const data = await plugin.builders.data.download(
          { url: `https://files.rcsb.org/download/${selectedProtein}.pdb`, isBinary: false },
          { state: { isGhost: false } },
        );
        const trajectory = await plugin.builders.structure.parseTrajectory(data, "pdb");
        const structure = await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
        setStructureRef(structure);

        // Apply toxicity color
        await updateStructureColor(toxicity);
      } catch (error) {
        console.error("Error loading PDB structure:", error);
      }
    };

    loadStructure();
  }, [plugin, selectedProtein]);

  // Update color when toxicity changes
  useEffect(() => {
    if (plugin && structureRef) {
      updateStructureColor(toxicity);
    }
  }, [toxicity, plugin, structureRef]);

  const updateStructureColor = async (tox: "Low" | "Moderate" | "High") => {
    if (!plugin) return;

    try {
      const color = getToxicityColor(tox);
      // Update theme colors in the plugin
      const update = plugin.build();
      const structures = plugin.state.data.select(
        StateSelection.Generators.root.subtree().withTag("structure-component"),
      );

      for (const s of structures) {
        update.to(s).update((old: any) => {
          if (!old?.type?.params) return old;
          return {
            ...old,
            type: {
              ...old.type,
              params: {
                ...old.type.params,
                colorTheme: { name: "uniform", params: { value: color } },
              },
            },
          };
        });
      }

      await update.commit();
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };

  const toggleSurface = async () => {
    if (!plugin) return;

    if (showSurface && surfaceRef) {
      // Remove surface
      try {
        await plugin.build().delete(surfaceRef).commit();
        setSurfaceRef(null);
        setShowSurface(false);
      } catch (error) {
        console.error("Error removing surface:", error);
      }
    } else {
      // Add surface - simplified approach
      setShowSurface(true);
      // Note: Full Mol* surface implementation requires complex API calls
      // This is a placeholder that toggles the state
    }
  };

  const toggleHBonds = async () => {
    if (!plugin) return;

    if (showHBonds && hbondsRef) {
      // Remove H-bonds
      try {
        await plugin.build().delete(hbondsRef).commit();
        setHbondsRef(null);
        setShowHBonds(false);
      } catch (error) {
        console.error("Error removing H-bonds:", error);
      }
    } else {
      // Add H-bonds - simplified approach
      setShowHBonds(true);
      // Note: Full Mol* H-bonds implementation requires complex API calls
      // This is a placeholder that toggles the state
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focusLigand: (ligandId: string) => {
      if (!plugin) return;

      try {
        // Focus camera on the structure
        const structures = plugin.state.data.select(
          StateSelection.Generators.root.subtree().withTag("structure-component"),
        );
        if (structures.length > 0 && structures[0].obj) {
          const loci = (structures[0].obj as any).data?.boundary?.sphere;
          if (loci) {
            plugin.managers.camera.focusLoci(loci);
          }
        }
      } catch (error) {
        console.error("Error focusing ligand:", error);
      }
    },
    setToxicityColor: (tox: "Low" | "Moderate" | "High") => {
      updateStructureColor(tox);
    },
  }));

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <h2 className="text-xl font-semibold text-foreground mb-3">Molecular Structure Viewer</h2>
        {/* <div className="flex gap-3 flex-wrap items-center mb-3"> */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-muted-foreground">Protein:</span>
          <Select value={selectedProtein} onValueChange={onProteinChange}>
            <SelectTrigger className="w-[220px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6LU7">6LU7 - SARS-CoV-2 Main Protease</SelectItem>
              <SelectItem value="1HSG">1HSG - HIV Protease</SelectItem>
              <SelectItem value="4YTH">4YTH - JAK1 Kinase</SelectItem>
              <SelectItem value="1VRT">1VRT - HIV-1 Reverse Transcriptase</SelectItem>
              <SelectItem value="5Y6H">5Y6H - CDK9 Kinase</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 flex-wrap items-center mb-3">
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Toxicity:</span>
            <span
              className="px-2 py-1 rounded font-medium"
              style={{
                backgroundColor: toxicity === "High" ? "#dc2626" : toxicity === "Moderate" ? "#f97316" : "#22c55e",
                color: "white",
              }}
            >
              {toxicity}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={toggleSurface}
            variant={showSurface ? "default" : "outline"}
            size="sm"
            className="transition-all"
          >
            {showSurface ? "✓ " : ""}Pocket Surface
          </Button>
          <Button
            onClick={toggleHBonds}
            variant={showHBonds ? "default" : "outline"}
            size="sm"
            className="transition-all"
          >
            {showHBonds ? "✓ " : ""}H-Bonds
          </Button>
        </div>
      </div>
      <div
        ref={parentRef}
        className="flex-1 bg-card"
        style={{ position: "relative", width: "100%", height: "100%", minHeight: "500px" }}
      />
    </Card>
  );
});
