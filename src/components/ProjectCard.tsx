'use client';

import { memo } from 'react';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  isExpanded: boolean;
  onClick: () => void;
  index: number;
}

const HILL_STATUS_ORDER = [
  'Exploring (Lots of Unknowns)',
  'Climbing (Making progress on approach)',
  'Peak (Decisions finalized)',
  'Executing (Building Known Work)',
  'Finishing (Polishing and Edge cases)',
  'No Status',
];

function getStatusOrder(status: string): number {
  const idx = HILL_STATUS_ORDER.findIndex(s => s.toLowerCase() === status.toLowerCase());
  return idx >= 0 ? idx : HILL_STATUS_ORDER.length;
}

function getStatusBadgeClass(status: string): string {
  const n = status.toLowerCase();
  if (n.includes('exploring')) return 'badge-exploring';
  if (n.includes('climbing')) return 'badge-climbing';
  if (n.includes('peak')) return 'badge-peak';
  if (n.includes('executing')) return 'badge-executing';
  if (n.includes('finishing')) return 'badge-finishing';
  return 'badge-nostatus';
}

function getShortStatus(status: string): string {
  const n = status.toLowerCase();
  if (n.includes('exploring')) return 'Exploring';
  if (n.includes('climbing')) return 'Climbing';
  if (n.includes('peak')) return 'Peak';
  if (n.includes('executing')) return 'Executing';
  if (n.includes('finishing')) return 'Finishing';
  if (n === 'no status') return 'No Status';
  return status;
}

function ProjectCard({ project, isExpanded, onClick }: ProjectCardProps) {
  const statusGroups = Object.entries(project.tasksByStatus).sort(
    ([a], [b]) => getStatusOrder(a) - getStatusOrder(b)
  );

  const totalTasks = project.tasks.length;
  const executingCount =
    (project.tasksByStatus['Executing (Building Known Work)']?.length || 0) +
    (project.tasksByStatus['Finishing (Polishing and Edge cases)']?.length || 0);
  const progressPercent = totalTasks > 0 ? Math.round((executingCount / totalTasks) * 100) : 0;

  return (
    <div
      className={`card cursor-pointer ${isExpanded ? 'ring-1 ring-[#2DD4BF]/30' : ''}`}
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-3 h-10 rounded flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#F8FAFC] text-base leading-tight mb-1 truncate">
              {project.name}
            </h3>
            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
              {getShortStatus(project.status)}
            </span>
          </div>
        </div>

        {/* Progress */}
        {totalTasks > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#64748B]">{totalTasks} subtasks</span>
              <span className="text-[#2DD4BF]">{executingCount} executing</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ backgroundColor: project.color, width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Notes */}
        {project.notes && (
          <p className="text-sm text-[#64748B] line-clamp-2">{project.notes}</p>
        )}

        {/* Expand toggle */}
        {totalTasks > 0 && (
          <div className="flex items-center justify-center mt-4 pt-3 border-t border-[rgba(148,163,184,0.1)]">
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              {isExpanded ? 'Hide' : 'Show'} subtasks
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={isExpanded ? 'rotate-180' : ''}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && totalTasks > 0 && (
        <div className="px-5 pb-5 pt-2 bg-[#13161D]/50">
          <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            Subtasks
          </h4>
          <div className="space-y-3">
            {statusGroups.map(([status, tasks]) => (
              <div key={status}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#94A3B8]">
                    {getShortStatus(status)}
                  </span>
                  <span className="text-xs text-[#64748B]">({tasks.length})</span>
                </div>
                <ul className="ml-4 space-y-1">
                  {tasks.map((task) => (
                    <li key={task.id} className="text-sm text-[#64748B] flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      {task.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ProjectCard);
