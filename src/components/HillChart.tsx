'use client';

import { motion } from 'framer-motion';
import { Project, getStatusPosition } from '@/lib/types';

interface HillChartProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  selectedProjectId?: string | null;
}

// Calculate Y position on the hill curve for a given X (0-100)
function getHillY(x: number): number {
  // Hill is a parabola: peaks at x=50
  const normalized = x / 100;
  const y = -4 * Math.pow(normalized - 0.5, 2) + 1;
  return y;
}

export default function HillChart({
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
  for (let x = 0; x <= 100; x += 1) {
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
        {/* Gradient for the hill fill */}
        <linearGradient id="hillFillGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(45, 212, 191, 0)" />
          <stop offset="100%" stopColor="rgba(45, 212, 191, 0.12)" />
        </linearGradient>

        {/* Gradient for the hill stroke */}
        <linearGradient id="hillStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(45, 212, 191, 0.4)" />
          <stop offset="50%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>

        {/* Glow filter for the curve */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Drop shadow for dots */}
        <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.4)" />
        </filter>

        {/* Glow for selected dot */}
        <filter id="selectedGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
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
      <motion.path
        d={areaPath}
        fill="url(#hillFillGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Hill curve */}
      <motion.path
        d={hillPath}
        stroke="url(#hillStrokeGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Peak marker */}
      <g>
        {/* Dashed line at peak */}
        <line
          x1={peakX}
          y1={peakY - 10}
          x2={peakX}
          y2={padding.top + chartHeight}
          stroke="rgba(252, 211, 77, 0.3)"
          strokeWidth="2"
          strokeDasharray="6,6"
        />
        {/* Peak diamond */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <path
            d={`M ${peakX} ${peakY - 20} L ${peakX + 8} ${peakY - 12} L ${peakX} ${peakY - 4} L ${peakX - 8} ${peakY - 12} Z`}
            fill="#FCD34D"
            opacity="0.8"
          />
        </motion.g>
      </g>

      {/* Phase labels */}
      <g className="text-xs">
        <text
          x={padding.left}
          y={height - 25}
          fill="#64748B"
          fontSize="12"
          fontWeight="500"
          textAnchor="start"
        >
          START
        </text>
        <text
          x={padding.left + chartWidth * 0.25}
          y={height - 25}
          fill="#C084FC"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
        >
          EXPLORING
        </text>
        <text
          x={peakX}
          y={height - 25}
          fill="#FCD34D"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
        >
          PEAK
        </text>
        <text
          x={padding.left + chartWidth * 0.75}
          y={height - 25}
          fill="#2DD4BF"
          fontSize="12"
          fontWeight="600"
          textAnchor="middle"
        >
          EXECUTING
        </text>
        <text
          x={width - padding.right}
          y={height - 25}
          fill="#4ADE80"
          fontSize="12"
          fontWeight="500"
          textAnchor="end"
        >
          DONE
        </text>
      </g>

      {/* Descriptive labels */}
      <g>
        <text
          x={padding.left + chartWidth * 0.25}
          y={height - 8}
          fill="#64748B"
          fontSize="10"
          textAnchor="middle"
          opacity="0.7"
        >
          Figuring things out
        </text>
        <text
          x={padding.left + chartWidth * 0.75}
          y={height - 8}
          fill="#64748B"
          fontSize="10"
          textAnchor="middle"
          opacity="0.7"
        >
          Making it happen
        </text>
      </g>

      {/* Project dots */}
      {projects.map((project, index) => {
        const progress = getStatusPosition(project.status);
        const x = padding.left + (progress / 100) * chartWidth;
        const y = padding.top + chartHeight - getHillY(progress) * chartHeight * 0.85;
        const isSelected = selectedProjectId === project.id;

        return (
          <motion.g
            key={project.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
            style={{ cursor: 'pointer' }}
            onClick={() => onProjectClick?.(project)}
          >
            {/* Selected ring */}
            {isSelected && (
              <motion.circle
                cx={x}
                cy={y}
                r={28}
                fill="none"
                stroke={project.color}
                strokeWidth="2"
                opacity="0.4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
              />
            )}

            {/* Outer glow ring for selected */}
            {isSelected && (
              <motion.circle
                cx={x}
                cy={y}
                r={24}
                fill={project.color}
                opacity="0.15"
                filter="url(#selectedGlow)"
              />
            )}

            {/* Main dot */}
            <motion.circle
              cx={x}
              cy={y}
              r={isSelected ? 18 : 14}
              fill={project.color}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={2}
              filter="url(#dotShadow)"
              initial={false}
              animate={{
                cx: x,
                cy: y,
                r: isSelected ? 18 : 14,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.2 }}
            />

            {/* Inner highlight */}
            <circle
              cx={x - 4}
              cy={y - 4}
              r={isSelected ? 5 : 4}
              fill="rgba(255,255,255,0.3)"
            />

            {/* Task count badge */}
            {project.tasks.length > 0 && (
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + index * 0.08 }}
              >
                <circle
                  cx={x + 12}
                  cy={y - 12}
                  r={11}
                  fill="#1F232E"
                  stroke={project.color}
                  strokeWidth={2}
                />
                <text
                  x={x + 12}
                  y={y - 8}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="700"
                >
                  {project.tasks.length}
                </text>
              </motion.g>
            )}

            {/* Project name tooltip on hover/select */}
            {isSelected && (
              <motion.g
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <rect
                  x={x - 60}
                  y={y + 26}
                  width={120}
                  height={24}
                  rx={6}
                  fill="#1F232E"
                  stroke="rgba(148, 163, 184, 0.2)"
                />
                <text
                  x={x}
                  y={y + 42}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="11"
                  fontWeight="500"
                >
                  {project.name.length > 16
                    ? project.name.substring(0, 14) + '...'
                    : project.name}
                </text>
              </motion.g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}
