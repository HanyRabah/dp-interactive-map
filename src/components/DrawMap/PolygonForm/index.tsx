// components/DrawMap/PolygonForm/index.tsx
import React from 'react';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { Slider, RadioGroup, Radio, FormControl, FormLabel, Button } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Edit as EditIcon } from 'lucide-react';
import { Polygon } from '@/types/projects';
import { GeoJsonPolygon } from '@/utils/coordinates';

interface PolygonStyle {
  fillColor?: string;
  hoverFillColor?: string;
  fillOpacity?: number;
  hoverFillOpacity?: number;
  lineColor?: string;
  lineWidth?: number;
  lineDashArray?: string;
  noHover?: boolean;
}


interface PolygonFormProps {
  polygon: Polygon;
  handlePolygonUpdate: (polygonId: string, updates: Partial<Polygon>) => void;
  onStartEditing: (polygonId: string) => void;
  isEditing?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`polygon-tabpanel-${index}`}
      aria-labelledby={`polygon-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const PolygonForm: React.FC<PolygonFormProps> = ({
  polygon,
  handlePolygonUpdate,
  onStartEditing,
  isEditing,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };


  const updatePolygonStyles = (styleUpdates: Partial<PolygonStyle>) => {
    handlePolygonUpdate(polygon.id, { style: { ...polygon.style, ...styleUpdates } });
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="polygon form tabs">
          <Tab label="Basic Info" id="polygon-tab-0" aria-controls="polygon-tabpanel-0" />
          <Tab label="Style" id="polygon-tab-1" aria-controls="polygon-tabpanel-1" />
          <Tab label="Popup" id="polygon-tab-2" aria-controls="polygon-tabpanel-2" />
          <Tab label="Coordinates" id="polygon-tab-3" aria-controls="polygon-tabpanel-3" />
        </Tabs>
      </Box>

      {/* Basic Info Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={2}>
          <Grid size={{xs: 12}}>
            <TextField
              fullWidth
              label="Name"
              value={polygon.name}
              onChange={(e) => handlePolygonUpdate(polygon.id, { name: e.target.value })}
              required
            />
          </Grid>
          <Grid size={{xs: 12}}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={polygon.description || ''}
              onChange={(e) => handlePolygonUpdate(polygon.id, { description: e.target.value })}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Style Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={2}>
          {polygon.type === "Polygon" as unknown as GeoJsonPolygon && (
            <>
              <Grid size={{xs: 12, sm: 6}}>
                <TextField
                  fullWidth
                  label="Fill Color"
                  type="color"
                  value={polygon.style?.fillColor || '#000000'}
                  onChange={(e) => updatePolygonStyles({ fillColor: e.target.value }) }
                  slotProps={{input: { sx: { height: '40px' }} }}
                />
              </Grid>
              <Grid size={{xs: 12, sm: 6}}>
                <TextField
                  fullWidth
                  label="Hover Fill Color"
                  type="color"
                  value={polygon.style?.hoverFillColor || '#333333'}
                  onChange={(e) => updatePolygonStyles({ hoverFillColor: e.target.value })}
                  slotProps={{input: { sx: { height: '40px' }} }}
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <Typography gutterBottom>Fill Opacity</Typography>
                <Slider
                  value={polygon.style?.fillOpacity || 0.5}
                  onChange={(_, value) => updatePolygonStyles({ fillOpacity: value as number })}
                  step={0.1}
                  marks
                  min={0}
                  max={1}
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <Typography gutterBottom>Hover Fill Opacity</Typography>
                <Slider
                  value={polygon.style?.hoverFillOpacity || 0.7}
                  onChange={(_, value) => updatePolygonStyles({ hoverFillOpacity: value as number })}
                  step={0.1}
                  marks
                  min={0}
                  max={1}
                />
              </Grid>
            </>
          )}
          <Grid size={{xs: 12, sm: 6}} >
            <TextField
              fullWidth
              label="Line Color"
              type="color"
              value={polygon.style?.lineColor || '#000000'}
              onChange={(e) => updatePolygonStyles( { lineColor: e.target.value })}
              slotProps={{input: { sx: { height: '40px' }} }}
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
            <TextField
              fullWidth
              type="number"
              label="Line Width"
              value={polygon.style?.lineWidth || 1}
              onChange={(e) => updatePolygonStyles( { lineWidth: parseInt(e.target.value) })}
            />
          </Grid>
          <Grid size={{xs: 12}}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={polygon.style?.noHover || false}
                  onChange={(e) => updatePolygonStyles({ noHover: e.target.checked })}
                />
              }
              label="Disable Hover Effects"
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Popup Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={2}>
          <Grid size={{xs: 12}}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Popup Type</FormLabel>
              <RadioGroup
                row
                value={polygon.popupDetails?.type || 'details'}
                onChange={(e) => handlePolygonUpdate(polygon.id, { popupDetails: { type: e.target.value as "link" | "details" } })}
              >
                <FormControlLabel value="link" control={<Radio />} label="Simple Link" />
                <FormControlLabel value="details" control={<Radio />} label="Detailed Info" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {polygon.popupDetails?.type === 'link' ? (
            <Grid size={{xs: 12}}>
              <TextField
                fullWidth
                label="Link URL"
                value={polygon.popupDetails?.link || ''}
                onChange={(e) => handlePolygonUpdate(polygon.id, { 
                  popupDetails: { ...polygon.popupDetails, link: e.target.value }
                })}
              />
            </Grid>
          ) : (
            <>
              <Grid size={{xs: 12}}>
                <TextField
                  fullWidth
                  label="Popup Title"
                  value={polygon.popupDetails?.title || ''}
                  onChange={(e) => handlePolygonUpdate(polygon.id, {
                    popupDetails: { ...polygon.popupDetails, title: e.target.value }
                  })}
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={polygon.popupDetails?.image || ''}
                  onChange={(e) => handlePolygonUpdate(polygon.id, {
                    popupDetails: { ...polygon.popupDetails, image: e.target.value }
                  })}
                />
              </Grid>
              <Grid size={{xs: 12}}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Popup Description"
                  value={polygon.popupDetails?.description || ''}
                  onChange={(e) => handlePolygonUpdate(polygon.id, {
                    popupDetails: { ...polygon.popupDetails, description: e.target.value }
                  })}
                />
              </Grid>
            </>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={2}>
          <Grid size={{xs: 12}} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Edit Coordinates</Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onStartEditing(polygon.id)}
              disabled={isEditing}
              color={isEditing ? "secondary" : "primary"}
            >
              {isEditing ? "Currently Editing" : "Edit on Map"}
            </Button>
          </Grid>
          <Grid size={{xs: 12}}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isEditing 
                ? "Click and drag points on the map to edit the polygon shape. Click 'Finish Editing' when done."
                : "Click 'Edit on Map' to modify the polygon shape directly on the map."}
            </Typography>
            <Box sx={{ 
              backgroundColor: 'grey.100', 
              p: 2, 
              borderRadius: 1,
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                {JSON.stringify(polygon.coordinates, null, 2)}
              </pre>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default PolygonForm;