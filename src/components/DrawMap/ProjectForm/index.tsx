// components/DrawMap/ProjectForm/index.tsx
"use client"
import React from 'react';
import { Mode, MODES } from '@/types/drawMap';

// MUI Imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Slider from '@mui/material/Slider';
import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { PolygonStyle } from '@prisma/client';
import PolygonForm from '../PolygonForm';


interface ProjectFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isEditMode: boolean;
  setAddNewProject: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitError: string | null;
  setSubmitError: React.Dispatch<React.SetStateAction<string | null>>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  handlePolygonRename: (polygonId: string, newName: string) => void;
  handleStyleUpdate: (polygonId: string, styleUpdates: Partial<PolygonStyle>) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteProject: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  setFormData,
  isEditMode,
  setAddNewProject,
  handleSubmit,
  isSubmitting,
  submitError,
  setSubmitError,
  setMode, 
  handleStyleUpdate,
  deleteDialogOpen,
  setDeleteDialogOpen,
  handleDeleteProject,
}) => { 
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name }
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </Grid>

        <Grid item xs={4}>
          <TextField
            fullWidth
            type="number"
            label="Latitude"
            value={formData.lat}
            onChange={e => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
            required
          />
        </Grid>
        
        <Grid item xs={4}>
          <TextField
            fullWidth
            type="number"
            label="Longitude"
            value={formData.lng}
            onChange={e => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
            required
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
            setMode(MODES.MARKER);
            }}
          >
            Set On Map
          </Button>
        </Grid>


        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Zoom Level"
            value={formData.zoomLevel}
            onChange={e => setFormData(prev => ({ ...prev, zoomLevel: parseInt(e.target.value) }))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hideMarker}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  hideMarker: e.target.checked 
                }))}
              />
            }
            label="Hide Marker"
          />
        </Grid>

        <Grid item xs={12}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Polygons</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setMode(MODES.DRAW)}
            >
              Draw Polygon
            </Button>
          </Grid>
          {formData.polygons.map((polygon) => (
            <Accordion key={polygon.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  width: '100%', 
                  pr: 2,
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {polygon.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {polygon.type}
                    </Typography>
                  </Box>
                  <Button
                    color="error"
                    size="small"
                    title='Delete Polygon'
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({
                        ...prev,
                        polygons: prev.polygons.filter(p => p.id !== polygon.id)
                      }));
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <PolygonForm
                  polygon={polygon}
                  handleStyleUpdate={handleStyleUpdate}
                  handlePolygonUpdate={(polygonId, updates) => {
                    setFormData(prev => ({
                      ...prev,
                      polygons: prev.polygons.map(p => 
                        p.id === polygonId 
                          ? { ...p, ...updates }
                          : p
                      )
                    }));
                  }}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
        
        {submitError && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          </Grid>
        )}

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setAddNewProject(false);
              setSubmitError(null);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Create Project'
            )}
          </Button>
        </Grid>
      </Grid>
      <Dialog
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
          <Button onClick={handleDeleteProject} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProjectForm;