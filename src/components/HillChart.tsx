'use client';

import { memo, useMemo } from 'react';
import { Project, getStatusPosition } from '@/lib/types';

interface HillChartProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  selectedProjectId?: string | null;
}

function getHillY(x: number): number {
  const normalized = x / 100;
  return -4 * Math.pow(normalized - 0.5, 2) + 1;
}

function HillChart({ projects, onProjectClick, selectedProjectId }: HillChartProps) {
  const width = 900;
  const height = 300;
  const padding = { top: 40, right: 50, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Memoize hill path
  const hillPath = useMemo(() => {
    const points: string[] = [];
    for (let x = 0; x <= 100; x += 4) {
      const px = padding.left + (x / 100) * chartWidth;
      const py = padding.top + chartHeight - getHillY(x) * chartHeight * 0.85;
      points.push(`${x === 0 ? 'M' : 'L'} ${px} ${py}`);
    }
    return points.join(' ');
  }, [chartWidth, chartHeight, padding.left, padding.top]);

  const peakX = padding.left + chartWidth / 2;

  // Pre-calculate project positions
  const projectPositions = useMemo(() => {
    const positionCounts: Record<number, number> = {};
    const positionIndices: Record<string, number> = {};

    // Count projects at each position
    projects.forEach((p) => {
      const pos = getStatusPosition(p.status);
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });

    // Assign index to each project at its position
    const currentIndices: Record<number, number> = {};
    projects.forEach((p) => {
      const pos = getStatusPosition(p.status);
      currentIndices[pos] = currentIndices[pos] || 0;
      positionIndices[p.id] = currentIndices[pos];
      currentIndices[pos]++;
    });

    return projects.map((project) => {
      const baseProgress = getStatusPosition(project.status);
      const total = positionCounts[baseProgress];
      const idx = positionIndices[project.id];
      const spread = total > 1 ? (idx - (total - 1) / 2) * 5 : 0;
      const progress = baseProgress + spread;

      return {
        project,
        x: padding.left + (progress / 100) * chartWidth,
        y: padding.top + chartHeight - getHillY(progress) * chartHeight * 0.85,
      };
    });
  }, [projects, chartWidth, chartHeight, padding.left, padding.top]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minHeight: '260px' }}>
      {/* Baseline */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={width - padding.right}
        y2={padding.top + chartHeight}
        stroke="#CBD5E1"
        strokeWidth="2"
      />

      {/* Hill curve */}
      <path d={hillPath} stroke="#00A7FB" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Peak line */}
      <line
        x1={peakX}
        y1={padding.top}
        x2={peakX}
        y2={padding.top + chartHeight}
        stroke="#FCC300"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.6"
      />

      {/* Labels */}
      <text x={padding.left} y={height - 20} fill="#8896AB" fontSize="11">START</text>
      <text x={padding.left + chartWidth * 0.25} y={height - 20} fill="#962EA0" fontSize="11" textAnchor="middle">EXPLORING</text>
      <text x={peakX} y={height - 20} fill="#B38A00" fontSize="11" textAnchor="middle">PEAK</text>
      <text x={padding.left + chartWidth * 0.75} y={height - 20} fill="#00A7FB" fontSize="11" textAnchor="middle">EXECUTING</text>
      <text x={width - padding.right} y={height - 20} fill="#8896AB" fontSize="11" textAnchor="end">DONE</text>

      {/* Project dots */}
      {projectPositions.map(({ project, x, y }) => {
        const isSelected = selectedProjectId === project.id;
        return (
          <g key={project.id} onClick={() => onProjectClick?.(project)} style={{ cursor: 'pointer' }}>
            {isSelected && (
              <circle cx={x} cy={y} r={22} fill="none" stroke={project.color} strokeWidth="2" opacity="0.4" />
            )}
            <circle cx={x} cy={y} r={isSelected ? 14 : 12} fill={project.color} />
            {project.tasks.length > 0 && (
              <>
                <circle cx={x + 10} cy={y - 10} r={9} fill="#FFFFFF" stroke={project.color} strokeWidth="2" />
                <text x={x + 10} y={y - 6} textAnchor="middle" fill="#2A3C6C" fontSize="9" fontWeight="700">
                  {project.tasks.length}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default memo(HillChart);
