'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HillChart from '@/components/HillChart';
import ProjectCard from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/lib/types';

export default function Home() {
  const { projects, lastUpdated, isMockData, isLoading, isError, refresh } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setExpandedCardId(project.id);
  };

  const handleCardClick = (projectId: string) => {
    setExpandedCardId(expandedCardId === projectId ? null : projectId);
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };

  return (
    <div className="min-h-screen bg-mesh bg-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo mark */}
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-amber)] opacity-20 blur-md" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-amber)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--bg-primary)]">
                    <path d="M3 20L12 6L21 20" />
                    <path d="M12 6V20" strokeDasharray="4 2" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="title-display text-2xl title-gradient">
                  Cycle Hill View
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                  Shape Up Progress Tracker
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {isMockData && (
                <span className="badge badge-peak">
                  Demo Mode
                </span>
              )}
              {lastUpdated && (
                <span className="text-sm text-[var(--text-muted)]">
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
              <button
                onClick={() => refresh()}
                className="btn-ghost"
                title="Refresh data"
              >
                <svg
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 rounded-xl bg-[var(--accent-rose)]/10 border border-[var(--accent-rose)]/30 text-[var(--accent-rose)]"
            >
              Failed to load data. Please check your ClickUp configuration.
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[var(--border-subtle)] border-t-[var(--accent-teal)] animate-spin" />
            </div>
            <p className="mt-6 text-[var(--text-muted)]">Loading projects...</p>
          </motion.div>
        ) : (
          <>
            {/* Hill Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hill-container p-8 mb-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Project Progress
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {projects.length} active project{projects.length !== 1 ? 's' : ''} in this cycle
                  </p>
                </div>
                <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-[var(--accent-teal)]/50 to-[var(--accent-teal)]" />
                    <span>Unknowns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-amber)]" />
                    <span>Knowns</span>
                  </div>
                </div>
              </div>
              <HillChart
                projects={projects}
                onProjectClick={handleProjectClick}
                selectedProjectId={selectedProject?.id}
              />
            </motion.div>

            {/* Section header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mb-6"
            >
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Project Details
              </h2>
              <div className="h-px flex-1 mx-6 bg-gradient-to-r from-[var(--border-subtle)] via-[var(--accent-teal)]/20 to-[var(--border-subtle)]" />
            </motion.div>

            {/* Project Cards Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <ProjectCard
                    project={project}
                    isExpanded={expandedCardId === project.id}
                    onClick={() => handleCardClick(project.id)}
                    index={index}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty state */}
            {projects.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20L12 6L21 20" />
                  </svg>
                </div>
                <p className="text-[var(--text-secondary)] text-lg">No projects found</p>
                <p className="text-[var(--text-muted)] text-sm mt-2">
                  Add tasks with a Shape Up Hill Status to see them here
                </p>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              Powered by{' '}
              <a
                href="https://basecamp.com/shapeup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-teal)] hover:underline underline-offset-4"
              >
                Shape Up
              </a>{' '}
              methodology
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-teal)] animate-pulse" />
              <span>Live data from ClickUp</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return date.toLocaleDateString();
}
