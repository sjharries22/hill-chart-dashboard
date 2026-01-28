'use client';

import { useState, useCallback } from 'react';
import HillChart from '@/components/HillChart';
import ProjectCard from '@/components/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/lib/types';

export default function Home() {
  const { projects, lastUpdated, isMockData, isLoading, isError, refresh } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProjectId(project.id);
    setExpandedCardId(project.id);
  }, []);

  const handleCardClick = useCallback((projectId: string) => {
    setExpandedCardId(prev => prev === projectId ? null : projectId);
    setSelectedProjectId(projectId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0F14]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0D0F14] border-b border-[rgba(148,163,184,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#FCD34D] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0F14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20L12 6L21 20" />
                </svg>
              </div>
              <div>
                <h1 className="title-display text-2xl title-gradient">Cycle Hill View</h1>
                <p className="text-sm text-[#64748B]">Shape Up Progress Tracker</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isMockData && <span className="badge badge-peak">Demo</span>}
              {lastUpdated && (
                <span className="text-sm text-[#64748B]">
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
              <button onClick={() => refresh()} className="btn-ghost" title="Refresh">
                <svg
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {isError && (
          <div className="mb-8 p-4 rounded-xl bg-[rgba(251,113,133,0.1)] border border-[rgba(251,113,133,0.3)] text-[#FB7185]">
            Failed to load data. Please check your ClickUp configuration.
          </div>
        )}

        {isLoading && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 rounded-full border-4 border-[#1F232E] border-t-[#2DD4BF] animate-spin" />
            <p className="mt-6 text-[#64748B]">Loading...</p>
          </div>
        ) : (
          <>
            {/* Hill Chart */}
            <div className="hill-container p-8 mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#F8FAFC]">Project Progress</h2>
                  <p className="text-sm text-[#64748B] mt-1">
                    {projects.length} project{projects.length !== 1 ? 's' : ''} in cycle
                  </p>
                </div>
              </div>
              <HillChart
                projects={projects}
                onProjectClick={handleProjectClick}
                selectedProjectId={selectedProjectId}
              />
            </div>

            {/* Section header */}
            <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6">Project Details</h2>

            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isExpanded={expandedCardId === project.id}
                  onClick={() => handleCardClick(project.id)}
                  index={index}
                />
              ))}
            </div>

            {projects.length === 0 && !isLoading && (
              <div className="text-center py-32">
                <p className="text-[#94A3B8]">No projects found</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(148,163,184,0.1)] py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-[#64748B]">
            Powered by{' '}
            <a href="https://basecamp.com/shapeup" target="_blank" rel="noopener noreferrer" className="text-[#2DD4BF] hover:underline">
              Shape Up
            </a>
          </p>
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <div className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
            <span>ClickUp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}
