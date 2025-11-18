import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { createRoot } from "react-dom/client";
import { DefaultPluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { Plugin } from "molstar/lib/mol-plugin-ui/plugin";
import { StateSelection } from "molstar/lib/mol-state";
import { Color } from "molstar/lib/mol-util/color";
import "molstar/lib/mol-plugin-ui/skin/light.scss";

export interface MolstarViewerRef {
  focusLigand: (ligandId: string) => void;
  setToxicityColor: (toxicity: "Low" | "Moderate" | "High") => void;
}

interface MolstarViewerProps {
  toxicity?: "Low" | "Moderate" | "High";
  selectedProtein: string; // ⬅️ lifted up to parent
}

export const MolstarViewer = forwardRef<MolstarViewerRef, MolstarViewerProps>(
  ({ toxicity = "Low", selectedProtein }, ref) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const [plugin, setPlugin] = useState<PluginUIContext | null>(null);
    const [structureRef, setStructureRef] = useState<any>(null);

    const getToxicityColor = (tox: "Low" | "Moderate" | "High"): Color => {
      switch (tox) {
        case "High":
          return Color.fromRgb(220, 38, 38); // red
        case "Moderate":
          return Color.fromRgb(249, 115, 22); // orange
        case "Low":
        default:
          return Color.fromRgb(34, 197, 94); // green
      }
    };

    useEffect(() => {
      const initViewer = async () => {
        if (!parentRef.current) return;

        const spec = DefaultPluginUISpec();
        const pluginInstance = new PluginUIContext(spec);
        await pluginInstance.init();

        createRoot(parentRef.current).render(<Plugin plugin={pluginInstance} />);

        setPlugin(pluginInstance);
      };

      initViewer();

      return () => {
        plugin?.dispose();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load structure when protein selection changes
    useEffect(() => {
      const loadStructure = async () => {
        if (!plugin) return;

        try {
          await plugin.clear();
        } catch (error) {
          console.error("Error clearing structure:", error);
        }

        try {
          const data = await plugin.builders.data.download(
            { url: `https://files.rcsb.org/download/${selectedProtein}.pdb`, isBinary: false },
            { state: { isGhost: false } },
          );
          const trajectory = await plugin.builders.structure.parseTrajectory(data, "pdb");
          const structure = await plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
          setStructureRef(structure);

          await updateStructureColor(toxicity);
        } catch (error) {
          console.error("Error loading PDB structure:", error);
        }
      };

      loadStructure();
    }, [plugin, selectedProtein]); // selectedProtein now comes from parent

    // Update color when toxicity changes
    useEffect(() => {
      if (plugin && structureRef) {
        updateStructureColor(toxicity);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toxicity, plugin, structureRef]);

    const updateStructureColor = async (tox: "Low" | "Moderate" | "High") => {
      if (!plugin) return;

      try {
        const color = getToxicityColor(tox);

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

    useImperativeHandle(ref, () => ({
      focusLigand: (ligandId: string) => {
        if (!plugin) return;

        try {
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

    return <div ref={parentRef} style={{ position: "relative", width: "100%", height: "100%", minHeight: "500px" }} />;
  },
);
