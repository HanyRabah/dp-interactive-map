// components/ProjectCard.tsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Project } from '@/types/projects';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <div className="flex justify-between mb-1">
          <span>Latitude:</span>
          <span>{project.lat}</span>
        </div>
        <div className="flex justify-between">
          <span>Longitude:</span>
          <span>{project.lng}</span>
        </div>
      </div>
    </div>
  );
}