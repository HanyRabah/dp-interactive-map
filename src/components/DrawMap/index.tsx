// components/DrawMap/index.tsx
"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import Map, { MapRef, Marker } from "react-map-gl";
import DrawControl from "./DrawControl";
import ModeSwitcher from "./ModeSwitcher";
import DeleteButton from "./DeleteButton";
import { Mode, MODES, Marker as MarkerType } from "@/types/drawMap";
import { Feature as MapFeature } from "@/types/map";
import { MAP_CONFIG, MAPBOX_TOKEN } from "@/app/constants/mapConstants";
import { Search, X } from 'lucide-react';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import { CircularProgress, List, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import ProjectForm from "./ProjectForm";
import { GeoJsonPolygon } from "@/utils/coordinates";
import { Polygon } from "@/types/projects";
import { Project } from "@/types/project";
import ProjectCard from "./ProjectForm/ProjectCard";
import useProjects from "@/hooks/useProjects";
 

interface Feature extends MapFeature {
  id: string;
}

export interface ProjectFormData {
  id: string;
  name: string;
  description?: string;
  lat: number | string;
  lng: number | string;
  zoom: number;
  hideMarker: boolean;
  polygon: Polygon | null;
}

const MapPin = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: "1rem", height: "1rem" }}
  >
    <path
      fillRule="evenodd"
      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
      clipRule="evenodd"
    />
  </svg>
);

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
}
export default function DrawMap() {
  const [features, setFeatures] = useState<Record<string, Feature>>({});
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [featureNames, setFeatureNames] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>(MODES.DRAW);
  const [marker, setMarker] = useState<MarkerType>();
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showNewProjectForm, setShowProjectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPolygonId, setEditingPolygonId] = useState<string | null>(null);
  const [drawControlKey, setDrawControlKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const initialFormData: ProjectFormData = {
    id: Date.now().toString(),
    name: "",
    description: "",
    lat: "",
    lng: "",
    zoom: 8,
    hideMarker: false,
    polygon: null,
  };

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
   const { fetchProjects, deleteProject, createProject, updateProject } = useProjects();

  const [viewport, setViewport] = useState({
    longitude: MAP_CONFIG.initialViewState.longitude,
    latitude: MAP_CONFIG.initialViewState.latitude,
    zoom: 8,
  });


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center
      })));
      setIsSearching(true);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    if (!mapRef.current) return;
    
    // Fly to location
    mapRef.current.flyTo({
      center: result.center,
      zoom: 14,
      duration: 2000
    });

    // Clear search
    setSearchResults([]);
    setSearchQuery('');
    setIsSearching(false);
  };


  const handleDrawCreate = useCallback(
    ({ features }: { features: Feature[] }) => {
      const feature = features[0];
      if (formData.polygon) {
        return;
      }
  
      const newPolygon: Polygon = {
        id: `polygon-${Date.now()}`,
        name: `New ${feature.geometry.type}`,
        type: feature.geometry.type,
        coordinates: JSON.stringify(feature.geometry.coordinates[0]),
        projectId: formData.id,
        style: feature.geometry.type === "Polygon" as unknown as GeoJsonPolygon
          ? {
              fillColor: "#000000",
              hoverFillColor: "#333333",
              fillOpacity: 0.5,
              hoverFillOpacity: 0.7,
              noHover: false,
            }
          : {
              lineColor: "#3B82F6",
              lineWidth: 2,
              lineDashArray: "2,2",
              noHover: false,
            },
      };
  
      setFormData(prev => ({ 
        ...prev, 
        polygon: newPolygon 
      }));
      setMode(MODES.VIEW);
    },
    [setFormData, formData.polygon, setMode, setFeatures, setDrawControlKey]
  );

  const handleFinishEditing = useCallback(() => {
    if (!editingPolygonId) return;

    const editedFeature = features[editingPolygonId];
    if (!editedFeature) return;

    setFormData((prev) => ({
      ...prev,
      polygon: formData.polygon
    }));

    setEditingPolygonId(null);
    setMode(MODES.VIEW);
  }, [editingPolygonId, features, formData.polygon]);

  const handleUpdateDrawing = useCallback(
    (e: { features: Feature[] }) => {
      setFeatures((currFeatures) => {
        const newFeatures = { ...currFeatures };
        for (const f of e.features) {
          newFeatures[f.id] = f;
        }
        return newFeatures;
      });
    },
    []
  );

  const handleDeleteDrawing = useCallback((e: { features: Feature[] }) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        delete newFeatures[f.id];
        setFeatureNames((prev) => {
          const newNames = { ...prev };
          delete newNames[f.id];
          return newNames;
        });
      }
      return newFeatures;
    });
    setSelectedFeature(null);
  }, []);

  const handleMapClick = useCallback(
    (e: mapboxgl.MapLayerMouseEvent) => {
      if (mode === MODES.MARKER) {
        setFormData((prev) => ({
          ...prev,
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        }));
        const newMarker: MarkerType = {
          id: `marker-${Date.now()}`,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          name: "New Marker",
        };
        setMarker(newMarker);
      }
    },
    [mode]
  );

  const handleDelete = () => {
    if (mode === MODES.MARKER && selectedMarker) {
      setMarker(undefined);
      setSelectedMarker(null);
    } else if (mode === MODES.DRAW && selectedFeature) {
      setFeatures((prev) => {
        const newFeatures = { ...prev };
        delete newFeatures[selectedFeature.id];
        setFeatureNames((prevNames) => {
          const updatedNames = { ...prevNames };
          delete updatedNames[selectedFeature.id];
          return updatedNames;
        });
        setSelectedFeature(null);
        return newFeatures;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.lat || !formData.lng) {
        throw new Error("Please fill in all required fields");
      }
      let response = null;
      if(!isEditMode) {
        response = await createProject(formData);
      } else {
        response = await updateProject(formData.id, formData)
      }

      if(response.error) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} project (${response.status})`);
       }

      setFormData(initialFormData);
      setShowProjectForm(false);
      isEditMode && setIsEditMode(false);
      await fetchProjectsData();

      setNotification({
        open: true,
        message: isEditMode
          ? "Project updated successfully"
          : "Project created successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Submit error:", error);
      setNotification({
        open: true,
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setFormData({
      id: project.id,
      name: project.name,
      description: project.description || "",
      lat: project.lat,
      lng: project.lng,
      zoom: project.zoom,
      hideMarker: project.hideMarker,
      polygon: JSON.parse(JSON.stringify(project.polygon)),
    });

    setViewport({
      longitude: project.lng,
      latitude: project.lat,
      zoom: project.zoom || 10,
    });

    setIsEditMode(true);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (projectId: string) => {

    const response = await deleteProject(projectId);
    if(response.error) {
      throw new Error(`Failed to delete project`);
    }
    setNotification({
      open: true,
      message: "Project Deleted successfully",
      severity: "success",
    });
    await fetchProjectsData();
  }

  const handleStartEditing = () => {
    const polygonToEdit = formData.polygon
    if (!polygonToEdit) return;

    setEditingPolygonId(polygonToEdit.id);
    setMode(MODES.VIEW);

    try {
      const coordinates = JSON.parse(polygonToEdit.coordinates);
      const feature: MapFeature = {
        type: "Feature",
        geometry: {
          type: polygonToEdit.type,
          coordinates: JSON.stringify(polygonToEdit.type) === "Polygon" ? [coordinates] : coordinates
        },
        properties: {
          id: polygonToEdit.id,
          lat: formData.lat as number,
          lng: formData.lng as number,
          name: polygonToEdit.name,
          description: polygonToEdit.description,
          style: polygonToEdit.style,
        }
      };
      console.log("Generated feature:", feature);

      setFeatures({[polygonToEdit.id]: feature as Feature });
      setDrawControlKey((prev) => prev + 1);

      const getCenter = (coordinates: Feature['geometry']['coordinates']) => {
        const bounds = coordinates.reduce(
          (acc, coord) => {
            acc[0] = Math.min(acc[0], coord[0]);
            acc[1] = Math.min(acc[1], coord[1]);
            acc[2] = Math.max(acc[2], coord[0]);
            acc[3] = Math.max(acc[3], coord[1]);
            return acc;
          },
          [Infinity, Infinity, -Infinity, -Infinity]
        );
        return [
          (bounds[0] + bounds[2]) / 2,
          (bounds[1] + bounds[3]) / 2,
        ];
      }

      const center = getCenter(coordinates);
      if (center) {
        setViewport((prev) => ({
          ...prev,
          longitude: center[0],
          latitude: center[1],
          zoom: 12, // Adjust the zoom level as needed
        }));
      }
      
    } catch (error) {
      console.error("Error parsing coordinates:", error);
      setNotification({
        open: true,
        message: "Failed to start editing: Invalid coordinate format",
        severity: "error",
      });
    }
  };

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      const projects = await fetchProjects();
      setProjects(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setNotification({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to load projects",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
    fetchProjectsData();
  },[]);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Search Box */}
        <div className="absolute top-4 left-4 z-10 w-[300px]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search location..."
            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Search Results */}
        {isSearching && searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
            <div className="p-2 flex justify-between items-center border-b">
              <span className="text-sm font-semibold">Search Results</span>
              <button 
                onClick={() => setIsSearching(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleLocationSelect(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-sm"
              >
                {result.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={notification.severity}
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        >
          {notification.message}
        </MuiAlert>
      </Snackbar>

      <Box sx={{ width: "66.666667%", position: "relative" }}>
        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          <ModeSwitcher currentMode={mode} onModeChange={setMode} />
        </Box>

        {(selectedFeature || selectedMarker) && (
          <Box sx={{ position: "absolute", bottom: 16, right: 16, zIndex: 10 }}>
            <DeleteButton
              onClick={handleDelete}
              type={
                mode === MODES.VIEW
                  ? "view"
                  : mode === MODES.MARKER
                  ? "marker"
                  : "feature"
              }
            />
          </Box>
        )}

        {editingPolygonId && (
          <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinishEditing}
            >
              Finish Editing
            </Button>
          </Box>
        )}

        <Map
          ref={mapRef}
          initialViewState={{
            longitude: MAP_CONFIG.initialViewState.longitude,
            latitude: MAP_CONFIG.initialViewState.latitude,
            zoom: 8,
          }}
          mapStyle="mapbox://styles/mapbox/standard-satellite"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
          onMove={(evt) => setViewport(evt.viewState)}
          {...viewport}
        >
          {(mode === MODES.DRAW || editingPolygonId) && (
            <DrawControl
              key={drawControlKey} // Ensure this key changes when editing starts
              position="top-left"
              displayControlsDefault={false}
              controls={{
                polygon: !editingPolygonId,
                line_string: !editingPolygonId,
                trash: true,
                combine_features: false,
                uncombine_features: false,
              }}
              defaultMode={mode === MODES.DRAW ? "draw_polygon" : "simple_select"}
              onCreate={handleDrawCreate}
              onUpdate={handleUpdateDrawing}
              onDelete={handleDeleteDrawing}
          />
          )}

          {mode === MODES.MARKER && marker && (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarker(marker);
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                    bgcolor: "rgba(59, 130, 246, 0.2)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "#3B82F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 10,
                    width: 16,
                    height: 16,
                    color: "#ffffff",
                  }}
                >
                  <MapPin />
                </Box>
              </Box>
            </Marker>
          )}
        </Map>
      </Box>

      <Box
        sx={{
          width: "33.333333%",
          p: 2,
          bgcolor: "grey.50",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            Projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData(initialFormData);
              setShowProjectForm(true);
            }}
          >
            Add Project
          </Button>
        </Box>

        {!showNewProjectForm && (
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id}
                    project={project} 
                    onEdit={() => handleEditProject(project)} 
                    onDelete={() => handleDeleteProject(project.id)}/>
                ))}
              </List>
            )}
          </Box>
        )}

        {showNewProjectForm && (
          <ProjectForm
            formData={formData}
            updateForm={setFormData as unknown as React.Dispatch<React.SetStateAction<ProjectFormData>>}
            isEditMode={isEditMode}
            onCancel={() => {
              setShowProjectForm(false); 
              setMode(MODES.VIEW);
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            setMode={setMode}
             handleStartEditing={handleStartEditing}
          />
        )}
       
      </Box>
    </Box>
  );
} 