"use client";
import React from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from "@prisma/client";

interface ProjectListProps {
    projects: Project[];
    onSelect: (id: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    loading: boolean;
  }

  
const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onSelect,
  isOpen,
  setIsOpen,
  loading
}) => {
  if (loading) {
    return (
      <div className="absolute top-4 right-4 z-10 w-[300px] bg-white/90 rounded-lg shadow-lg p-4 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10 w-[300px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white/90 rounded-lg shadow-lg hover:bg-white/100 transition-all"
      >
        <span className="text-sm font-medium">Project List</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="mt-2 bg-white/90 rounded-lg shadow-lg max-h-[400px] overflow-y-auto backdrop-blur-sm">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                onSelect(project.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors border-b border-gray-100 last:border-0"
            >
              <h3 className="text-sm font-medium mb-1">{project.name}</h3>
              {project.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;