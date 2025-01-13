// components/ProjectForm.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import DrawMap from './index';
import { Project } from '@/types/projects';
import { MAP_CONFIG } from '@/app/constants/mapConstants';
import { Feature } from '@/types/map';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<Project>({
    id: project?.id || '',
    name: project?.name || '',
    description: project?.description || '',
    lat: project?.lat || MAP_CONFIG.initialViewState.latitude,
    lng: project?.lng || MAP_CONFIG.initialViewState.longitude,
    zoomLevel: project?.zoomLevel || 10,
    hideMarker: project?.hideMarker || false,
    polygons: project?.polygons || []
  });

  const handleMapData = (mapFeatures: Record<string, Feature>, featureNames: Record<string, string>) => {
    // Convert map features to project polygons
    const polygons = Object.values(mapFeatures).map(feature => ({
      id: feature.id,
      name: featureNames[feature.id] || `Unnamed ${feature.geometry.type}`,
      type: feature.geometry.type === 'LineString' ? 'Line' : 'Normal Polygon',
      coordinates: feature.geometry.coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }))
    }));

    // Update form data with map information
    setFormData(prev => ({
      ...prev,
      polygons
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {project ? 'Edit Project' : 'Add New Project'}
            </h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}>
            <div className="space-y-4">
              {/* Basic Information Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Zoom Level</label>
                  <input
                    type="number"
                    name="zoomLevel"
                    value={formData.zoomLevel}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    min="1"
                    max="20"
                    required
                  />
                </div>

                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="hideMarker"
                    checked={formData.hideMarker}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Hide Marker
                  </label>
                </div>
              </div>

              {/* Map Section */}
              <div className="h-[600px] border rounded-lg overflow-hidden">
                <DrawMap
                  initialViewState={{
                    latitude: formData.lat,
                    longitude: formData.lng,
                    zoom: formData.zoomLevel
                  }}
                  onDataChange={handleMapData}
                  initialPolygons={formData.polygons.map(polygon => ({
                    id: polygon.id,
                    type: polygon.type === 'Line' ? 'LineString' : 'Polygon',
                    coordinates: polygon.coordinates.map(coord => [coord.lng, coord.lat])
                  }))}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {project ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
// // components/ProjectForm.tsx

// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
// import PolygonControl from './PolygonControl';
// import MarkerList from './MarkerList';
//  import { Feature, FeatureNames, HandleMarkerNameChange, HandleNameChange, MODES, Marker as MarkerType, Mode,  } from '@/types/drawMap';
// import DetailsPanel from './DetailsPanel';

// interface FormData {
//   name: string;
//   lat: string | number;
//   lng: string | number;
//   zoom: number;
//   hideAnchor: boolean;
//   description: string;
//   url: string;
// }

// interface ProjectFormProps {
//   onSubmit: (formData: FormData) => void;
//   mode: Mode;
//   polygons: Record<string, Feature>;
//   polygonNames: FeatureNames;
//   selectedPolygon: Feature | null;
//   onSelectPolygon: React.Dispatch<React.SetStateAction<Feature | null>>;
//   onDeletePolygon: (featureId: string) => void;
//   polygonNameChange: HandleNameChange;
//   markers: MarkerType[];
//   selectedMarker: MarkerType | null
//   onSelectMarker: React.Dispatch<React.SetStateAction<MarkerType | null>>
//   onDeleteMarker: (featureId: string) => void;
//   markerNameChange: HandleMarkerNameChange;
//   handleDelete: () => void;

// }

// const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit,
//   mode,
//   polygons,
//   polygonNames,
//   selectedPolygon,
//   onSelectPolygon,
//   onDeletePolygon,
//   polygonNameChange,
//   markers,
//   selectedMarker,
//   onSelectMarker,
//   onDeleteMarker,
//   markerNameChange,
//   handleDelete
//  }) => {
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     lat: '',
//     lng: '',
//     zoom: 12,
//     hideAnchor: false,
//     description: '',
//     url: '',
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   return (
//     <Card className="h-auto rounded-none mb-5">
//       <CardHeader>
//         <CardTitle>Add New Project</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div>
//             <Label>Name</Label>
//             <Input
//               value={formData.name}
//               onChange={e => setFormData({...formData, name: e.target.value})}
//               required
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Latitude</Label>
//               <Input
//                 type="number"
//                 step="any"
//                 value={formData.lat}
//                 onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
//                 required
//               />
//             </div>
//             <div>
//               <Label>Longitude</Label>
//               <Input
//                 type="number"
//                 step="any"
//                 value={formData.lng}
//                 onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <Label>Zoom Level</Label>
//             <Input
//               type="number"
//               value={formData.zoom}
//               onChange={e => setFormData({...formData, zoom: parseInt(e.target.value)})}
//               required
//             />
//           </div>

//           <div className="flex items-center space-x-2">
//             <Checkbox
//               id="hideAnchor"
//               checked={formData.hideAnchor}
//               onCheckedChange={checked => setFormData({...formData, hideAnchor: !!checked})}
//             />
//             <Label htmlFor="hideAnchor">Hide Anchor</Label>
//           </div>

//           <div>
//             <Label>Description</Label>
//             <Textarea
//               value={formData.description}
//               onChange={e => setFormData({...formData, description: e.target.value})}
//               rows={3}
//             />
//           </div>

//           <div>
//             <Label>URL</Label>
//             <Input
//               type="url"
//               value={formData.url}
//               onChange={e => setFormData({...formData, url: e.target.value})}
//             />
//           </div>

//           <DetailsPanel
//               mode={mode}
//               selectedFeature={selectedPolygon}
//               selectedMarker={selectedMarker}
//               featureNames={polygonNames}
//               onNameChange={polygonNameChange}
//               onDelete={handleDelete}
//             />
            

//           {mode === MODES.DRAW ? (
//             <PolygonControl
//               features={polygons}
//               featureNames={polygonNames}
//               selectedFeature={selectedPolygon}
//               onSelect={onSelectPolygon}
//               onDelete={onDeletePolygon}  
//               onNameChange={polygonNameChange}
//             />
//           ) : (
//             <MarkerList
//               markers={markers}
//               selectedMarker={selectedMarker}
//               onSelect={onSelectMarker}
//               onDelete={onDeleteMarker}
//               onNameChange={markerNameChange}
//             />
//           )}

//           <div className="flex justify-end gap-2">
//             <Button type="submit">Save Project</Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default ProjectForm;