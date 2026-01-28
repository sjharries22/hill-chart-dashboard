'use client';

import { memo } from 'react';
import { Project, getStatusPosition } from '@/lib/types';

interface HillChartProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  selectedProjectId?: string | null;
}

// Calculate Y position on the hill curve for a given X (0-100)
function getHillY(x: number): number {
  const normalized = x / 100;
  const y = -4 * Math.pow(normalized - 0.5, 2) + 1;
  return y;
}

function HillChart({
  projects,
  onProjectClick,
  selectedProjectId,
}: HillChartProps) {
  const width = 900;
  const height = 320;
  const padding = { top: 50, right: 50, bottom: 70, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate hill path points
  const hillPoints: string[] = [];
  for (let x = 0; x <= 100; x += 2) {
    const px = padding.left + (x / 100) * chartWidth;
    const py = padding.top + chartHeight - getHillY(x) * chartHeight * 0.85;
    hillPoints.push(`${x === 0 ? 'M' : 'L'} ${px} ${py}`);
  }
  const hillPath = hillPoints.join(' ');

  // Create area path for gradient fill
  const areaPath = hillPath + ` L ${width - padding.right} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  // Peak position
  const peakX = padding.left + chartWidth / 2;
  const peakY = padding.top + chartHeight - getHillY(50) * chartHeight * 0.85;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ minHeight: '280px' }}
    >
      <defs>
        <linearGradient id="hillFillGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(45, 212, 191, 0)" />
          <stop offset="100%" stopColor="rgba(45, 212, 191, 0.12)" />
        </linearGradient>
        <linearGradient id="hillStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
          <stop offset="50%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
      </defs>

      {/* Subtle grid lines */}
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1={padding.left + chartWidth * ratio}
          y1={padding.top}
          x2={padding.left + chartWidth * ratio}
          y2={padding.top + chartHeight}
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Horizontal baseline */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={width - padding.right}
        y2={padding.top + chartHeight}
        stroke="rgba(148, 163, 184, 0.15)"
        strokeWidth="2"
      />

      {/* Hill area fill */}
      <path d={areaPath} fill="url(#hillFillGradient)" />

      {/* Hill curve */}
      <path
        d={hillPath}
        stroke="url(#hillStrokeGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Peak marker */}
      <line
        x1={peakX}
        y1={peakY - 10}
        x2={peakX}
        y2={padding.top + chartHeight}
        stroke="rgba(252, 211, 77, 0.3)"
        strokeWidth="2"
        strokeDasharray="6,6"
      />
      <path
        d={`M ${peakX} ${peakY - 20} L ${peakX + 8} ${peakY - 12} L ${peakX} ${peakY - 4} L ${peakX - 8} ${peakY - 12} Z`}
        fill="#FCD34D"
        opacity="0.8"
      />

      {/* Phase labels */}
      <text x={padding.left} y={height - 25} fill="#64748B" fontSize="12" fontWeight="500" textAnchor="start">
        START
      </text>
      <text x={padding.left + chartWidth * 0.25} y={height - 25} fill="#C084FC" fontSize="12" fontWeight="600" textAnchor="middle">
        EXPLORING
      </text>
      <text x={peakX} y={height - 25} fill="#FCD34D" fontSize="12" fontWeight="600" textAnchor="middle">
        PEAK
      </text>
      <text x={padding.left + chartWidth * 0.75} y={height - 25} fill="#2DD4BF" fontSize="12" fontWeight="600" textAnchor="middle">
        EXECUTING
      </text>
      <text x={width - padding.right} y={height - 25} fill="#4ADE80" fontSize="12" fontWeight="500" textAnchor="end">
        DONE
      </text>

      {/* Descriptive labels */}
      <text x={padding.left + chartWidth * 0.25} y={height - 8} fill="#64748B" fontSize="10" textAnchor="middle" opacity="0.7">
        Figuring things out
      </text>
      <text x={padding.left + chartWidth * 0.75} y={height - 8} fill="#64748B" fontSize="10" textAnchor="middle" opacity="0.7">
        Making it happen
      </text>

      {/* Project dots - spread out overlapping ones */}
      {projects.map((project, index) => {
        const baseProgress = getStatusPosition(project.status);

        // Count how many projects share this position and find this project's index among them
        const samePositionProjects = projects.filter(
          (p) => getStatusPosition(p.status) === baseProgress
        );
        const positionIndex = samePositionProjects.findIndex((p) => p.id === project.id);
        const totalAtPosition = samePositionProjects.length;

        // Spread projects horizontally if multiple share the same status
        const spreadOffset = totalAtPosition > 1
          ? (positionIndex - (totalAtPosition - 1) / 2) * 4
          : 0;
        const progress = baseProgress + spreadOffset;

        const x = padding.left + (progress / 100) * chartWidth;
        const y = padding.top + chartHeight - getHillY(progress) * chartHeight * 0.85;
        const isSelected = selectedProjectId === project.id;

        return (
          <g
            key={project.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onProjectClick?.(project)}
            className="transition-transform duration-150"
          >
            {/* Selected ring */}
            {isSelected && (
              <circle
                cx={x}
                cy={y}
                r={26}
                fill="none"
                stroke={project.color}
                strokeWidth="2"
                opacity="0.4"
              />
            )}

            {/* Main dot */}
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 16 : 13}
              fill={project.color}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={2}
              className="transition-all duration-150"
            />

            {/* Inner highlight */}
            <circle
              cx={x - 3}
              cy={y - 3}
              r={isSelected ? 4 : 3}
              fill="rgba(255,255,255,0.3)"
            />

            {/* Task count badge */}
            {project.tasks.length > 0 && (
              <g>
                <circle
                  cx={x + 11}
                  cy={y - 11}
                  r={10}
                  fill="#1F232E"
                  stroke={project.color}
                  strokeWidth={2}
                />
                <text
                  x={x + 11}
                  y={y - 7}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="700"
                >
                  {project.tasks.length}
                </text>
              </g>
            )}

            {/* Project name tooltip on select */}
            {isSelected && (
              <g>
                <rect
                  x={x - 60}
                  y={y + 24}
                  width={120}
                  height={24}
                  rx={6}
                  fill="#1F232E"
                  stroke="rgba(148, 163, 184, 0.2)"
                />
                <text
                  x={x}
                  y={y + 40}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="11"
                  fontWeight="500"
                >
                  {project.name.length > 16 ? project.name.substring(0, 14) + '...' : project.name}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default memo(HillChart);
