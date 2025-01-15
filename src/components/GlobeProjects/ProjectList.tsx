"use client";
import React from "react";
import { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  isOpen: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onSelect,
  isOpen
}) => {

  return (
    <div className={`fixed top-20 right-0 h-screen w-[400px] bg-black shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className=" overflow-y-auto h-[calc(100%-64px)] group/item ">
          {projects.map((project) => {
            return <button
            key={project.id}
            onClick={() => {
              onSelect(project);
            }}
            className="group/edit w-full text-left  shadow-md px-3 py-3 hover:bg-white transition-colors mb-4 flex items-start space-x-4"
          >
            {/* Placeholder for project image */}
            <div className="w-44 h-32 bg-gray-200 rounded-md flex items-center justify-center">
              {project?.polygon?.popupDetails?.image ? (
                <img
                  src={project.polygon.popupDetails.image}
                  alt={project.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span className="text-xs text-gray-500">No Image</span>
              )}
            </div>

            <div className="flex-1 ">
              <h2 className="text-lg font-medium mb-1 text-white group-hover/edit:text-black transition-colors">{project.name}</h2>
              {project.description && (
                <p className="text-xs text-gray-600 line-clamp-3 text-white group-hover/edit:text-gray-600 transition-colors">
                  {project.description}
                </p>
              )}
            </div>
          </button>
          })}
        </div>
    </div>
  );
};

export default ProjectList;