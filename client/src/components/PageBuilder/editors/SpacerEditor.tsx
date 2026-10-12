import type { PageComponent } from "../types";

interface SpacerEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: any) => void;
}

export function SpacerEditor({ component, updateComponent }: SpacerEditorProps) {
  const currentHeight = typeof component.height === "number" ? component.height : Number(component.height) || 40;

  const presets = [20, 40, 60, 80, 100];
  const isCustom = !presets.includes(currentHeight);

  const handlePresetChange = (val: string) => {
    if (val === "custom") return;
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      updateComponent("height", num);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    updateComponent("height", isNaN(val) ? 0 : Math.max(0, val));
  };

  return (
    <>
      <div className="editor-field">
        <label>Height Preset</label>
        <select
          value={isCustom ? "custom" : currentHeight.toString()}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          {presets.map((px) => (
            <option key={px} value={px.toString()}>
              {px}px
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="editor-field">
        <label>Height (px)</label>
        <input
          type="number"
          min={0}
          max={1000}
          value={currentHeight}
          onChange={handleCustomChange}
        />
      </div>
    </>
  );
}
