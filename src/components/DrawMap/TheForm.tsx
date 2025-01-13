// "use client"
// import React, { useState, useCallback, useEffect } from 'react';
// import Map, { Layer, Marker, Source } from 'react-map-gl';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { 
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordion';
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Trash2, Plus, Edit, MapPin } from 'lucide-react';
// import DrawControl from './DrawControl';
// import { MAP_CONFIG, MAPBOX_TOKEN } from '@/app/constants/mapConstants';
// import { toast } from 'react-toastify';
// import { DrawCreateEvent } from '@mapbox/mapbox-gl-draw';


// const MapPinIcon = () => (
//   <svg 
//     xmlns="http://www.w3.org/2000/svg" 
//     viewBox="0 0 24 24" 
//     fill="currentColor"
//     className="w-4 h-4"
//   >
//     <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//   </svg>
// );

// // Types
// interface Coordinate {
//   lat: number;
//   lng: number;
// }

// interface Polygon {
//   id: string;
//   name: string;
//   type: 'Normal Polygon' | 'Line';
//   coordinates: Coordinate[];
//   feature?: any;
// }

// interface Project {
//   id: string;
//   name: string;
//   description: string;
//   lat: number;
//   lng: number;
//   zoomLevel: number;
//   hideMarker: boolean;
//   polygons: Polygon[];
// }

// enum Mode {
//   VIEW = 'view',
//   DRAW_POLYGON = 'draw_polygon',
//   DRAW_LINE = 'draw_line',
//   SET_MARKER = 'set_marker'
// }

// // Separate hook for managing project state
// const useProjectState = (initialProjects: Project[] = []) => {
//   const [projects, setProjects] = useState<Project[]>(initialProjects);
//   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
//   const [tempProject, setTempProject] = useState<Project | null>(null);

//   const addProject = useCallback((project: Project) => {
//     setProjects(prev => [...prev, project]);
//   }, []);

//   const updateProject = useCallback((updatedProject: Project) => {
//     setProjects(prev =>
//       prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
//     );
//   }, []);

//   const deleteProject = useCallback((projectId: string) => {
//     setProjects(prev => prev.filter(p => p.id !== projectId));
//     setSelectedProject(null);
//   }, []);

//   return {
//     projects,
//     selectedProject,
//     tempProject,
//     setSelectedProject,
//     setTempProject,
//     addProject,
//     updateProject,
//     deleteProject
//   };
// };

// const ProjectForm = ({
//   viewport,
//   setMode,
//   project,
//   onSubmit,
//   onClose,
//   selectedProject,
//   setDrawingPolygon,
//   setTempProject,
//   tempProject
// }: {
//   viewport: { latitude: number; longitude: number; zoom: number };
//   setMode: (mode: Mode) => void;
//   project?: Project;
//   onSubmit: (project: Project) => void;
//   onClose: () => void;
//   selectedProject: Project | null;
//   setDrawingPolygon: (polygon: Polygon | null) => void;
//   setTempProject: (project: Project | null) => void;
//   tempProject?: Project | null;
// }) => {
//   const [formData, setFormData] = useState<Project>(
//     project || {
//       id: Date.now().toString(),
//       name: '',
//       description: '',
//       lat: viewport.latitude,
//       lng: viewport.longitude,
//       zoomLevel: viewport.zoom,
//       hideMarker: false,
//       polygons: []
//     }
//   );

//   // Listen for project updates
//   React.useEffect(() => {
//     if (project) {
//       setFormData(project);
//     } else if (tempProject) {
//       setFormData(tempProject);
//     }
//   }, [project, tempProject]);

//   const startDrawingPolygon = (type: 'Normal Polygon' | 'Line') => {
//     // Create a temporary project if none exists
//     const currentProject = selectedProject || tempProject || formData;
//     if (!tempProject) {
//       setTempProject(currentProject);
//     }

//     if(type === 'Normal Polygon') {
//       setMode(Mode.DRAW_POLYGON);
//     } else {
//       setMode(Mode.DRAW_LINE);
//     }
    
//     const newPolygon: Polygon = {
//       id: Date.now().toString(),
//       name: `New ${type}`,
//       type,
//       coordinates: []
//     };
    
//     setDrawingPolygon(newPolygon);
//     setMode(type === 'Normal Polygon' ? Mode.DRAW_POLYGON : Mode.DRAW_LINE);
//   };

//   const handleSetMarkerClick = () => {
//     const currentProject = selectedProject || tempProject || formData;
//     if (!tempProject) {
//       setTempProject(currentProject);
//     }
//     setMode(Mode.SET_MARKER);
//   };


//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validate coordinates
//     const hasInvalidPolygons = formData.polygons.some(
//       polygon => polygon.coordinates.length === 0
//     );
    
//     if (hasInvalidPolygons) {
//       toast.error("All polygons must have coordinates");
//       return;
//     }
    
//     onSubmit(formData);
//   };

//   // Update formData when new polygon is added
//   useEffect(() => {
//     if (tempProject) {
//       setFormData(prev => ({
//         ...prev,
//         polygons: tempProject.polygons || []
//       }));
//     }
//   }, [tempProject]);

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <label className="text-sm font-medium">Name</label>
//         <Input
//           value={formData.name}
//           onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
//           required
//         />
//       </div>
      
//       <div className="space-y-2">
//         <label className="text-sm font-medium">Description</label>
//         <Textarea
//           value={formData.description}
//           onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Latitude</label>
//           <div className="flex gap-2">
//             <Input
//               type="number"
//               step="any"
//               value={formData.lat}
//               onChange={e => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
//               required
//             />
//             <Button type="button" onClick={handleSetMarkerClick}>
//               Set on Map
//             </Button>
//           </div>
//         </div>
        
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Longitude</label>
//           <Input
//             type="number"
//             step="any"
//             value={formData.lng}
//             onChange={e => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
//             required
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <label className="text-sm font-medium">Zoom Level</label>
//         <Input
//           type="number"
//           value={formData.zoomLevel}
//           onChange={e => setFormData(prev => ({ ...prev, zoomLevel: parseInt(e.target.value) }))}
//           required
//         />
//       </div>

//       <div className="flex items-center space-x-2">
//         <Checkbox
//           id="hideMarker"
//           checked={formData.hideMarker}
//           onCheckedChange={(checked) => 
//             setFormData(prev => ({ ...prev, hideMarker: checked === true }))
//           }
//         />
//         <label htmlFor="hideMarker" className="text-sm font-medium">
//           Hide Marker
//         </label>
//       </div>

//       <div className="space-y-4">
//         <div className="flex justify-between items-center">
//           <h3 className="text-lg font-semibold">Polygons</h3>
//           <div className="flex gap-2">
//             <Button
//               type="button"
//               onClick={() => startDrawingPolygon('Normal Polygon')}
//               variant="outline"
//               size="sm"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               Add Polygon
//             </Button>
//             <Button
//               type="button"
//               onClick={() => startDrawingPolygon('Line')}
//               variant="outline"
//               size="sm"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               Add Line
//             </Button>
//           </div>
//         </div>

//         <Accordion type="single" collapsible className="w-full">
//           {formData.polygons.map((polygon, index) => (
//             <AccordionItem key={polygon.id} value={polygon.id}>
//               <AccordionTrigger className="hover:no-underline">
//                 <div className="flex justify-between items-center w-full pr-4">
//                   <span>{polygon.name}</span>
//                   <span className="text-sm text-gray-500">{polygon.type}</span>
//                 </div>
//               </AccordionTrigger>
//               <AccordionContent>
//                 <div className="space-y-2 p-4">
//                   {polygon.coordinates.map((coord, coordIndex) => (
//                     <div key={coordIndex} className="flex gap-2">
//                       <div className="w-1/2">
//                         <span className="text-sm">Lat: {coord.lat}</span>
//                       </div>
//                       <div className="w-1/2">
//                         <span className="text-sm">Lng: {coord.lng}</span>
//                       </div>
//                     </div>
//                   ))}
//                   <Button
//                     type="button"
//                     variant="destructive"
//                     size="sm"
//                     onClick={() => {
//                       setFormData(prev => ({
//                         ...prev,
//                         polygons: prev.polygons.filter(p => p.id !== polygon.id)
//                       }));
//                     }}
//                   >
//                     <Trash2 className="w-4 h-4 mr-2" />
//                     Delete Polygon
//                   </Button>
//                 </div>
//               </AccordionContent>
//             </AccordionItem>
//           ))}
//         </Accordion>
//       </div>

//       <div className="flex justify-end gap-2 pt-4">
//         <Button type="button" variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button type="submit">
//           {project ? 'Save Changes' : 'Create Project'}
//         </Button>
//       </div>
//     </form>
//   );
// };

// const MapProject = () => {
//   const {
//     projects,
//     selectedProject,
//     tempProject,
//     setSelectedProject,
//     setTempProject,
//     addProject,
//     updateProject,
//     deleteProject
//   } = useProjectState();

//   const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
//   const [mode, setMode] = useState<Mode>(Mode.VIEW);
//   const [viewport, setViewport] = useState({
//     longitude: MAP_CONFIG.initialViewState.longitude,
//     latitude: MAP_CONFIG.initialViewState.latitude,
//     zoom: 9
//   });
//   const [drawingPolygon, setDrawingPolygon] = useState<Polygon | null>(null);

//    // Reset drawing state when mode changes to VIEW
//    useEffect(() => {
//     if (mode === Mode.VIEW) {
//       setDrawingPolygon(null);
//     }
//   }, [mode]);


//   const handleDrawCreate = useCallback((e: any) => {
//     if (!drawingPolygon || !e.features?.[0]) return;

//     const feature = e.features[0];
//     // Handle both polygon and line string coordinates
//     const rawCoordinates = feature.geometry.type === 'LineString' 
//       ? feature.geometry.coordinates 
//       : feature.geometry.coordinates[0];

//     const coordinates = rawCoordinates.map((coord: number[]) => ({
//       lng: coord[0],
//       lat: coord[1]
//     }));

//     if (!coordinates?.length) {
//       toast.error("Polygon must have at least one coordinate.");
//       return;
//     }

//     const newPolygon: Polygon = {
//       ...drawingPolygon,
//       coordinates,
//       feature
//     };

//     if (selectedProject) {
//       const updatedProject = {
//         ...selectedProject,
//         polygons: [...selectedProject.polygons, newPolygon],
//       };
//       updateProject(updatedProject);
//       setSelectedProject(updatedProject);
//     } else if (tempProject) {
//       const updatedTempProject = {
//         ...tempProject,
//         polygons: [...(tempProject.polygons || []), newPolygon],
//       };
//       setTempProject(updatedTempProject);
//     }

//     setDrawingPolygon(null);
//     setMode(Mode.VIEW);
//     toast.success("Polygon added successfully!");
//   }, [selectedProject, tempProject, drawingPolygon, updateProject, setSelectedProject]);

//   const onUpdate = useCallback((e: DrawCreateEvent) => {
//     setFeatures(currFeatures => {
//       const newFeatures = { ...currFeatures };
//       for (const f of e.features) {
//         newFeatures[f.id] = f;
//       }
//       return newFeatures;
//     });
//   }, []);

//   const onDelete = useCallback((e) => {
//     setFeatures(currFeatures => {
//       const newFeatures = { ...currFeatures };
//       for (const f of e.features) {
//         delete newFeatures[f.id];
//       }
//       return newFeatures;
//     });
//   }, []);


//   const resetFormState = useCallback(() => {
//     setTempProject(null);
//     setSelectedProject(null);
//     setIsProjectFormOpen(false);
//     setMode(Mode.VIEW);
//     setDrawingPolygon(null);
//   }, []);

//   const handleAddProject = (project: Project) => {
//     const finalProject = {
//       ...project,
//       polygons: tempProject?.polygons || project.polygons,
//     };

//     addProject(finalProject);
//     resetFormState(); // Centralized function to clean up states
//   };

//   const handleEditProject = useCallback(
//     (project: Project) => {
//       updateProject(project);
//       resetFormState();
//       toast.success("Project updated successfully!");
//     },
//     [resetFormState]
//   );

//   const handleDeleteProject = (projectId: string) => {
//     if (window.confirm('Are you sure you want to delete this project?')) {
//       deleteProject(projectId);
//       setSelectedProject(null);
//     }
//   };

//   const handleMapClick = useCallback((event: { lngLat: { lng: number; lat: number } }) => {
//     const { lng, lat } = event.lngLat;

//     if (mode === Mode.SET_MARKER) {

//       if (selectedProject) {
//         const updatedProject = { ...selectedProject, lat, lng };
//         updateProject(updatedProject);
//         setSelectedProject(updatedProject);
//         toast.success("Marker position updated!");
//       } else if (tempProject) {
//         setTempProject({ ...tempProject, lat, lng });
//         toast.success("Marker position set!");
//       }
//       setMode(Mode.VIEW);
//     }
//   }, [mode, selectedProject, tempProject, updateProject, setSelectedProject]);

//   const ProjectCard = ({ project }: { project: Project }) => (
//     <Card className="mb-4">
//       <CardContent className="p-6">
//         <div className="flex justify-between items-start mb-4">
//           <div>
//             <h3 className="text-xl font-semibold">{project.name}</h3>
//             <p className="text-gray-600">{project.description}</p>
//           </div>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setSelectedProject(project);
//                 setIsProjectFormOpen(true);
//               }}
//             >
//               <Edit className="w-4 h-4 mr-2" />
//               Edit
//             </Button>
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={() => handleDeleteProject(project.id)}
//             >
//               <Trash2 className="w-4 h-4 mr-2" />
//               Delete
//             </Button>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4 text-sm">
//           <div>
//             <span className="font-medium">Latitude: </span>
//             {project.lat}
//           </div>
//           <div>
//             <span className="font-medium">Longitude: </span>
//             {project.lng}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <div className="flex h-screen">
//       <div className="w-2/3 relative">
//         <Map
//           {...viewport}
//           onMove={evt => setViewport(evt.viewState)}
//           mapStyle="mapbox://styles/mapbox/streets-v12"
//           mapboxAccessToken={MAPBOX_TOKEN}
//           onClick={handleMapClick}
//           dragRotate={false} // Disable rotation for better drawing experience
//         >
//           {mode !== Mode.VIEW && (
//             <DrawControl
//               position="top-left"
//               displayControlsDefault={false}
//               controls={{
//                 polygon: mode === Mode.DRAW_POLYGON,
//                 line_string: mode === Mode.DRAW_LINE,
//                 trash: true
//               }}
//               defaultMode={mode === Mode.DRAW_POLYGON ? "draw_polygon" : "draw_line_string"}
//               onCreate={handleDrawCreate}
              
//             />
//           )}

//           {/* Render existing polygons */}
//           {(selectedProject?.polygons || tempProject?.polygons || []).map(polygon => (
//             <Source
//               key={polygon.id}
//               type="geojson"
//               data={polygon.feature}
//             >
//               {polygon.type === 'Line' ? (
//                 <Layer
//                   type="line"
//                   paint={{
//                     'line-color': '#4a90e2',
//                     'line-width': 2
//                   }}
//                 />
//               ) : (
//                 <Layer
//                   type="fill"
//                   paint={{
//                     'fill-color': '#4a90e2',
//                     'fill-opacity': 0.3
//                   }}
//                 />
//               )}
//             </Source>
//           ))}

//           {/* Show marker only if not hidden */}
//           {(selectedProject || tempProject) && 
//            !(selectedProject?.hideMarker || tempProject?.hideMarker) && (
//             <Marker
//               longitude={tempProject?.lng ?? selectedProject?.lng ?? viewport.longitude}
//               latitude={tempProject?.lat ?? selectedProject?.lat ?? viewport.latitude}
//               anchor="bottom"
//               draggable
//               onDrag={(event) => {
//                 const { lng, lat } = event.lngLat;
//                 if (selectedProject) {
//                   setSelectedProject({ ...selectedProject, lat, lng });
//                 } else if (tempProject) {
//                   setTempProject({ ...tempProject, lat, lng });
//                 }
//               }
//               }
//             >
//               <div className="text-blue-500">
                
//                   <div 
//                   className="relative flex items-center justify-center group" 
//                 >
//                   {/* Pulsing Circle */}
//                   {/* <div 
//                     className="absolute w-16 h-16 rounded-full animate-ping opacity-75"
//                     style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
//                   />
//                    */}
//                   {/* Inner Circle */}
//                   <div 
//                     className="absolute w-8 h-8 rounded-full flex items-center justify-center"
//                     style={{ backgroundColor: '#3B82F6' }}
//                   />
                  
//                   {/* Icon */}
//                   <div className="relative z-10 w-4 h-4" style={{ color: '#ffffff' }}>
//                     <MapPinIcon />
//                   </div>

//                 </div>

//               </div>
//             </Marker>
//           )}
//         </Map>
//       </div>

//       <div className="w-1/3 p-6 bg-gray-50 overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Projects</h1>
//           <Button onClick={() => {
//             setSelectedProject(null);
//             setIsProjectFormOpen(true);
//           }}>
//             <Plus className="w-4 h-4 mr-2" />
//             Add New Project
//           </Button>
//         </div>

//         <div className="space-y-4">
//           {projects.map(project => (
//             <ProjectCard key={project.id} project={project} />
//           ))}
//         </div>

//         <Dialog open={isProjectFormOpen} >
//           <DialogContent className="max-w-2xl">
//               <DialogTitle>
//                 {selectedProject ? 'Edit Project' : 'Add New Project'}
//               </DialogTitle>
//               <ProjectForm
//                 viewport={viewport}
//                 setMode={setMode}
//                 project={selectedProject || undefined}
//                 onSubmit={selectedProject ? handleEditProject : handleAddProject}
//                 selectedProject={selectedProject}
//                 setDrawingPolygon={setDrawingPolygon}
//                 setTempProject={setTempProject}
//                 tempProject={tempProject} // Add this prop
//                 onClose={() => {
//                   setIsProjectFormOpen(false);
//                   setSelectedProject(null);
//                   setTempProject(null);
//                 }}
//               />
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default MapProject;