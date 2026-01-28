'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  isExpanded: boolean;
  onClick: () => void;
  index: number;
}

// Order for hill statuses (left to right on the hill)
const HILL_STATUS_ORDER = [
  'Exploring (Lots of Unknowns)',
  'Climbing (Making progress on approach)',
  'Peak (Decisions finalized)',
  'Executing (Building Known Work)',
  'Finishing (Polishing and Edge cases)',
  'No Status',
];

function getStatusOrder(status: string): number {
  const index = HILL_STATUS_ORDER.findIndex(
    (s) => s.toLowerCase() === status.toLowerCase()
  );
  return index >= 0 ? index : HILL_STATUS_ORDER.length;
}

function getStatusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('exploring')) return 'badge-exploring';
  if (normalized.includes('climbing')) return 'badge-climbing';
  if (normalized.includes('peak')) return 'badge-peak';
  if (normalized.includes('executing')) return 'badge-executing';
  if (normalized.includes('finishing')) return 'badge-finishing';
  return 'badge-nostatus';
}

export default function ProjectCard({
  project,
  isExpanded,
  onClick,
  index,
}: ProjectCardProps) {
  // Sort status groups by hill position
  const statusGroups = Object.entries(project.tasksByStatus).sort(
    ([a], [b]) => getStatusOrder(a) - getStatusOrder(b)
  );

  const totalTasks = project.tasks.length;

  // Calculate progress based on hill position (Executing/Finishing = done)
  const executingCount =
    (project.tasksByStatus['Executing (Building Known Work)']?.length || 0) +
    (project.tasksByStatus['Finishing (Polishing and Edge cases)']?.length || 0);
  const progressPercent =
    totalTasks > 0 ? Math.round((executingCount / totalTasks) * 100) : 0;

  return (
    <motion.div
      layout
      className={`card cursor-pointer overflow-hidden ${
        isExpanded ? 'ring-1 ring-[var(--accent-teal)]/30' : ''
      }`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Color indicator with glow */}
          <div className="relative flex-shrink-0">
            <div
              className="absolute inset-0 rounded-lg blur-md opacity-40"
              style={{ backgroundColor: project.color }}
            />
            <div
              className="relative w-3 h-12 rounded-lg"
              style={{ backgroundColor: project.color }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--text-primary)] text-base leading-tight mb-1 truncate">
              {project.name}
            </h3>
            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
              {getShortStatus(project.status)}
            </span>
          </div>
        </div>

        {/* Task progress */}
        {totalTasks > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[var(--text-muted)]">
                {totalTasks} subtask{totalTasks !== 1 ? 's' : ''}
              </span>
              <span className="text-[var(--accent-teal)]">
                {executingCount} executing
              </span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                style={{ backgroundColor: project.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              />
            </div>
          </div>
        )}

        {/* Notes preview */}
        {project.notes && (
          <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
            {project.notes}
          </p>
        )}

        {/* Expand indicator */}
        {totalTasks > 0 && (
          <div className="flex items-center justify-center mt-4 pt-3 border-t border-[var(--border-subtle)]">
            <motion.div
              className="flex items-center gap-2 text-xs text-[var(--text-muted)]"
              animate={{ opacity: isExpanded ? 0.5 : 1 }}
            >
              <span>{isExpanded ? 'Hide details' : 'Show subtasks'}</span>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </motion.div>
          </div>
        )}
      </div>

      {/* Expanded task list */}
      <AnimatePresence>
        {isExpanded && totalTasks > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 bg-[var(--bg-secondary)]/50">
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Subtasks by Status
              </h4>
              <div className="space-y-4">
                {statusGroups.map(([status, tasks]) => (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-2">
                      <HillStatusIcon status={status} />
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {getShortStatus(status)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-0.5 rounded-full">
                        {tasks.length}
                      </span>
                    </div>
                    <ul className="ml-6 space-y-1.5">
                      {tasks.map((task) => (
                        <li
                          key={task.id}
                          className="text-sm text-[var(--text-muted)] flex items-start gap-2"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="leading-relaxed">{task.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getShortStatus(status: string): string {
  // Shorten the hill status for display
  if (status.toLowerCase().includes('exploring')) return 'Exploring';
  if (status.toLowerCase().includes('climbing')) return 'Climbing';
  if (status.toLowerCase().includes('peak')) return 'Peak';
  if (status.toLowerCase().includes('executing')) return 'Executing';
  if (status.toLowerCase().includes('finishing')) return 'Finishing';
  if (status.toLowerCase() === 'no status') return 'No Status';
  return status;
}

function HillStatusIcon({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  // Exploring - compass
  if (normalized.includes('exploring')) {
    return (
      <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center">
        <svg
          className="w-3 h-3 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    );
  }

  // Climbing - arrow up
  if (normalized.includes('climbing')) {
    return (
      <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
        <svg
          className="w-3 h-3 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
    );
  }

  // Peak - flag
  if (normalized.includes('peak')) {
    return (
      <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center">
        <svg
          className="w-3 h-3 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 21l9-9 9 9M12 3v9"
          />
        </svg>
      </div>
    );
  }

  // Executing - play
  if (normalized.includes('executing')) {
    return (
      <div className="w-5 h-5 rounded-md bg-teal-500/20 flex items-center justify-center">
        <svg
          className="w-3 h-3 text-teal-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
  }

  // Finishing - check
  if (normalized.includes('finishing')) {
    return (
      <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center">
        <svg
          className="w-3 h-3 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
  }

  // No Status - circle
  return (
    <div className="w-5 h-5 rounded-md bg-slate-500/20 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-slate-400" />
    </div>
  );
}
