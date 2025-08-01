import { List, KanbanSquare } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Props {
  viewMode: "list" | "kanban";
  onViewModeChange: (value: "list" | "kanban") => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: Props) {
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(v) => v && onViewModeChange(v as any)}
      className="mb-6"
    >
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="kanban" aria-label="Kanban view">
        <KanbanSquare className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
