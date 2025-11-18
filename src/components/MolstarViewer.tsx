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

export interface MolstarViewerRef {
  focusLigand: (ligandId: string) => void;
  setToxicityColor: (toxicity: "Low" | "Moderate" | "High") => void;
}

interface MolstarViewerProps {
  toxicity?: "Low" | "Moderate" | "High";
}

export const MolstarViewer = forwardRef<MolstarViewerRef, MolstarViewerProps>(({ toxicity = "Low" }, ref) => {
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

      // Load PDB structure
      try {
        const data = await pluginInstance.builders.data.download(
          { url: "https://files.rcsb.org/download/1VRT.pdb", isBinary: false },
          { state: { isGhost: false } },
        );
        const trajectory = await pluginInstance.builders.structure.parseTrajectory(data, "pdb");
        const structure = await pluginInstance.builders.structure.hierarchy.applyPreset(trajectory, "default");
        setStructureRef(structure);

        // Apply toxicity color
        await updateStructureColor(toxicity);
      } catch (error) {
        console.error("Error loading PDB structure:", error);
      }
    };

    initViewer();

    return () => {
      plugin?.dispose();
    };
  }, []);

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
      </div>
      <div
        ref={parentRef}
        className="flex-1 bg-card"
        style={{ position: "relative", width: "100%", height: "100%", minHeight: "500px" }}
      />
    </Card>
  );
});
