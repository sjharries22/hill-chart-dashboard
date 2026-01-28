export interface Task {
  id: string;
  name: string;
  status: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  notes: string;
  color: string;
  tasks: Task[];
  tasksByStatus: Record<string, Task[]>;
}

export interface HillPosition {
  x: number;
  y: number;
  progress: number;
}

// Map ShapeUp hill statuses to positions (0-100)
// Left side (0-50) = unknowns, figuring things out
// Peak (50) = decisions finalized
// Right side (50-100) = execution, known work
export const STATUS_POSITIONS: Record<string, number> = {
  // ShapeUp custom field values
  'exploring (lots of unknowns)': 15,
  'exploring': 15,
  'climbing (making progress on approach)': 35,
  'climbing': 35,
  'peak (decisions finalized)': 50,
  'peak': 50,
  'executing (building known work)': 75,
  'executing': 75,

  // Fallback task statuses
  'open': 5,
  'closed': 100,
  'complete': 100,
  'done': 100,
};

// Distinct colors for projects on the hill chart (Metopio brand-aligned)
const PROJECT_COLORS_PALETTE = [
  '#00A7FB', // Metopio Blue
  '#962EA0', // Metopio Purple
  '#FF7D1A', // Metopio Orange
  '#2A3C6C', // Metopio Navy
  '#FCC300', // Metopio Gold
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F472B6', // Pink
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export function getStatusPosition(status: string): number {
  const normalized = status.toLowerCase().trim();
  return STATUS_POSITIONS[normalized] ?? 25;
}

export function getProjectColor(projectName: string, index: number): string {
  // Use a consistent color based on index, cycling through the palette
  return PROJECT_COLORS_PALETTE[index % PROJECT_COLORS_PALETTE.length];
}
