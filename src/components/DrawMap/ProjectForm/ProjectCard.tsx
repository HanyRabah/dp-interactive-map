// components/ProjectCard.tsx
import React from 'react';
import { Edit2,  Trash2 } from 'lucide-react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Project } from '@/types/project';
import { Typography } from '@mui/material';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const DeletePopup = ({ 
  deleteDialogOpen, 
  setDeleteDialogOpen, 
  deleteProject }: {
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  deleteProject: () => void;
}) => {
  return  <Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
>
  <DialogTitle>Delete Project?</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete this project? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
    <Button onClick={deleteProject} color="error" autoFocus>
      Delete
    </Button>
  </DialogActions>
</Dialog>
}
export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDeleteProject = () => {
    setDeleteDialogOpen(false);
    onDelete();
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Typography variant="h6">{project.name}</Typography>
          <Typography variant="subtitle1">{project.description}</Typography>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
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
      <DeletePopup 
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        deleteProject={handleDeleteProject}
      />
    </div>
  );
}
