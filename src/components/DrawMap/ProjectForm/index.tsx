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
import Grid from '@mui/material/Grid2';


// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {  CircularProgress } from '@mui/material';
import PolygonForm from '../PolygonForm';
import { ProjectFormData } from '..';
import { Polygon } from '@/types/projects';


 
interface ProjectFormProps {
  formData: ProjectFormData;
  updateForm: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  isEditMode: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
   handleStartEditing: (polygonId: string) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  updateForm,
  isEditMode,
  onCancel,
  onSubmit,
  isSubmitting,
  setMode,  
  handleStartEditing
}) => { 
 
  const updateFormData = (key: string, value: any) => {
    updateForm(prev => ({ ...prev, [key]: value }));
  }
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2}> 
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name || ''}
              onChange={e => updateFormData('name', e.target.value)}
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={e => updateFormData('description', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Latitude"
              value={formData.lat}
              onChange={e => updateFormData('lat', parseFloat(e.target.value))}
              required
            />
          </Grid>
          
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Longitude"
              value={formData.lng}
              onChange={e => updateFormData('lng', parseFloat(e.target.value))}
              required
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
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

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              type="number"
              label="Zoom Level"
              value={formData.zoom}
              onChange={e => updateFormData('zoom', parseInt(e.target.value))}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hideMarker}
                  onChange={(e) => updateFormData('hideMarker', e.target.checked)}
                />
              }
              label="Hide Marker"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Project Polygon</Typography>
              {!formData.polygon && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setMode(MODES.DRAW)}
                >
                  Draw Polygon
                </Button>
              )}
            </Grid>
            {formData.polygon && (
              <Accordion>
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
                        {formData.polygon.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {formData.polygon.type} 
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Button
                    color="error"
                    size="small"
                    title='Delete Polygon'
                    startIcon={<DeleteIcon />}
                    onClick={() => updateFormData('polygon', null)}
                  > 
                    Delete Polygon 
                  </Button>
                  <PolygonForm
                    polygon={formData.polygon}
                    onStartEditing={handleStartEditing}
                    handlePolygonUpdate={(_, updates) => {
                      updateFormData('polygon', { ...formData.polygon, ...updates });
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
          

        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
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
    </Box>
  )
}

export default ProjectForm;