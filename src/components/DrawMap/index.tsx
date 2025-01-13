// components/DrawMap/index.tsx
"use client";
import React, { useState, useCallback, useEffect } from "react";
import Map, { Marker } from "react-map-gl";
import DrawControl from "./DrawControl";
import ModeSwitcher from "./ModeSwitcher";
import DeleteButton from "./DeleteButton";
import { Mode, MODES, Feature, Marker as MarkerType } from "@/types/drawMap";
import { MAP_CONFIG, MAPBOX_TOKEN } from "@/app/constants/mapConstants";

// MUI Imports
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { CircularProgress, IconButton, List, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { EditIcon } from "lucide-react";
import ProjectForm from "./ProjectForm";
import { coordinateUtils } from "@/utils/coordinates";

interface PolygonStyle {
  fillColor?: string;
  hoverFillColor?: string;
  fillOpacity?: number;
  hoverFillOpacity?: number;
  lineColor?: string;
  lineWidth?: number;
  lineOpacity?: number;
  lineDashArray?: string | number[];
  noHover?: boolean;
}

interface Polygon {
  id: string;
  name: string;
  type: "Polygon" | "LineString";
  coordinates: number[][];
  style?: PolygonStyle;
}

interface Project {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  hideMarker: boolean;
  description?: string;
  polygons: Polygon[];
}

interface FormData {
  id: string;
  name: string;
  description?: string;
  lat: number | string;
  lng: number | string;
  zoomLevel: number;
  hideMarker: boolean;
  polygons: Polygon[];
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPolygonId, setEditingPolygonId] = useState<string | null>(null);
  const [drawControlKey, setDrawControlKey] = useState(0);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState<FormData>({
    id: Date.now().toString(),
    name: "",
    description: "",
    lat: "",
    lng: "",
    zoomLevel: 8,
    hideMarker: false,
    polygons: [],
  });

  const [viewport, setViewport] = useState({
    longitude: MAP_CONFIG.initialViewState.longitude,
    latitude: MAP_CONFIG.initialViewState.latitude,
    zoom: 8,
  });

  const handleDrawCreate = useCallback(
    ({ features }: { features: Feature[] }) => {
      const feature = features[0];
      const newPolygon: Polygon = {
        id: `polygon-${Date.now()}`,
        name: `New ${feature.geometry.type}`,
        type: feature.geometry.type as "Polygon" | "LineString",
        coordinates: coordinateUtils.fromGeoJson(feature.geometry),
        style:
          feature.geometry.type === "Polygon"
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

      setFormData((prev) => ({
        ...prev,
        polygons: [...prev.polygons, newPolygon],
      }));

      setMode(MODES.VIEW);
    },
    [setMode]
  );

  const handleFinishEditing = useCallback(() => {
    if (!editingPolygonId) return;

    const editedFeature = features[editingPolygonId];
    if (!editedFeature) return;

    setFormData((prev) => ({
      ...prev,
      polygons: prev.polygons.map((polygon) =>
        polygon.id === editingPolygonId
          ? {
              ...polygon,
              coordinates: coordinateUtils.fromGeoJson(editedFeature.geometry),
            }
          : polygon
      ),
    }));

    setEditingPolygonId(null);
    setMode(MODES.VIEW);
  }, [editingPolygonId, features]);

  const handlePolygonRename = (polygonId: string, newName: string) => {
    setFormData((prev) => ({
      ...prev,
      polygons: prev.polygons.map((polygon) =>
        polygon.id === polygonId ? { ...polygon, name: newName } : polygon
      ),
    }));
  };

  const handleStyleUpdate = (
    polygonId: string,
    styleUpdates: Partial<PolygonStyle>
  ) => {
    setFormData((prev) => ({
      ...prev,
      polygons: prev.polygons.map((polygon) =>
        polygon.id === polygonId
          ? {
              ...polygon,
              style: {
                ...polygon.style,
                ...styleUpdates,
                lineDashArray: Array.isArray(styleUpdates.lineDashArray)
                  ? JSON.stringify(styleUpdates.lineDashArray)
                  : styleUpdates.lineDashArray,
              },
            }
          : polygon
      ),
    }));
  };

  const onUpdate = useCallback(
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

  const onDelete = useCallback((e: { features: Feature[] }) => {
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
    setSubmitError(null);

    try {
      if (!formData.name || !formData.lat || !formData.lng) {
        throw new Error("Please fill in all required fields");
      }

      const projectData = {
        ...formData,
        polygons: formData.polygons.map((polygon) => ({
          ...polygon,
          coordinates: coordinateUtils.toDb(polygon.coordinates),
        })),
      };

      const url = isEditMode
        ? `/api/projects/${formData.id}`
        : "/api/projects";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save project");
      }

      const result = await response.json();
      console.log(`Project ${isEditMode ? "updated" : "created"}:`, result);

      setFormData({
        id: Date.now().toString(),
        name: "",
        description: "",
        lat: "",
        lng: "",
        zoomLevel: 8,
        hideMarker: false,
        polygons: [],
      });

      setShowProjectForm(false);
      setIsEditMode(false);
      await fetchProjects();

      setNotification({
        open: true,
        message: isEditMode
          ? "Project updated successfully"
          : "Project created successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const projects = await response.json();
      if (!Array.isArray(projects)) {
        throw new Error("Invalid response format");
      }

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
  };

  const handleEditProject = (project: Project) => {
    setFormData({
      id: project.id,
      name: project.name,
      description: project.description || "",
      lat: project.lat,
      lng: project.lng,
      zoomLevel: project.zoom,
      hideMarker: project.hideMarker,
      polygons: project.polygons
    });

    setViewport({
      longitude: project.lng,
      latitude: project.lat,
      zoom: project.zoom || 10,
    });

    setIsEditMode(true);
    setShowProjectForm(true);
  };

  const deleteProject = async (projectId: string) => {
    try {
      if (!projectId) {
        throw new Error("No project ID provided");
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      await fetchProjects();
      setNotification({
        open: true,
        message: "Project deleted successfully",
        severity: "success",
      });

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      setNotification({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to delete project",
        severity: "error",
      });
    }
  };

  const handleStartEditing = (polygonId: string) => {
    const polygonToEdit = formData.polygons.find((p) => p.id === polygonId);
    if (!polygonToEdit) return;

    setEditingPolygonId(polygonId);
    setMode(MODES.DRAW);

    try {
      const coordinates = coordinateUtils.parse(polygonToEdit.coordinates);
      if (!coordinateUtils.validate(coordinates)) {
        throw new Error("Invalid coordinates format");
      }

      const feature = {
        id: polygonId,
        type: "Feature",
        properties: {},
        geometry: coordinateUtils.toGeoJson(
          coordinates,
          polygonToEdit.type as "Polygon" | "LineString"
        ),
      };

      setDrawControlKey((prev) => prev + 1);
      setFeatures({ [polygonId]: feature });
    } catch (error) {
      console.error("Error parsing coordinates:", error);
      setNotification({
        open: true,
        message: "Failed to start editing: Invalid coordinate format",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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
          initialViewState={{
            longitude: MAP_CONFIG.initialViewState.longitude,
            latitude: MAP_CONFIG.initialViewState.latitude,
            zoom: 8,
          }}
          mapStyle="mapbox://styles/mapbox/standard-satellite"
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={handleMapClick}
          {...viewport}
          onMove={(evt) => setViewport(evt.viewState)}
        >
          {(mode === MODES.DRAW || editingPolygonId) && (
            <DrawControl
              key={drawControlKey}
              position="top-left"
              displayControlsDefault={false}
              controls={{
                polygon: !editingPolygonId,
                line_string: !editingPolygonId,
                trash: true,
                combine_features: false,
                uncombine_features: false,
              }}
              defaultMode="simple_select"
              onCreate={handleDrawCreate}
              onUpdate={onUpdate}
              onDelete={onDelete}
              initialFeatures={Object.values(features)}
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
            onClick={() => setShowProjectForm(true)}
          >
            Add New Project
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
                  <Box
                    key={project.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      pr: 2,
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {project.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {project.description}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditProject(project)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this project?"
                            )
                          ) {
                            deleteProject(project.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </List>
            )}
          </Box>
        )}

        {showNewProjectForm && (
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            isEditMode={isEditMode}
            setAddNewProject={setShowProjectForm}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
            setSubmitError={setSubmitError}
            setMode={setMode}
            handlePolygonRename={handlePolygonRename}
            handleStyleUpdate={handleStyleUpdate}
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            onStartEditing={handleStartEditing}
            editingPolygonId={editingPolygonId}
          />
        )}
      </Box>
    </Box>
  );
}