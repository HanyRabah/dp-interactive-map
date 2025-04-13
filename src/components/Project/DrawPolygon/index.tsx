// components/DrawPolygon/index.tsx
"use client";

import ErrorBoundary from "@/components/Layout/ErrorBoundary";
import { MAP_CONFIG, MAPBOX_TOKEN } from "@/constants/mapConstants";
import { Feature, Mode, MODES } from "@/types/drawMap";
import { Polygon, ProjectFormData } from "@/types/projects";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, MapRef, Source } from "react-map-gl";
import MapSearchBox from "../MapSearchBox";
import PolygonForm from "../PolygonForm/index";

/**
 * DrawPolygon Component for creating and editing map polygons
 */
export default function DrawPolygon({ polygons }: { polygons?: any }) {
	// State management
	const [showEditor, setShowEditor] = useState(false);
	const [features, setFeatures] = useState<Record<string, Feature>>({});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [mode, setMode] = useState<Mode>(MODES.VIEW);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [styleLoaded, setStyleLoaded] = useState(false);
	const [savingPolygon, setSavingPolygon] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [isDrawReady, setIsDrawReady] = useState(false);
	const [hasPolygon, setHasPolygon] = useState(false);
	const [mapInitialized, setMapInitialized] = useState(false);
	const { projectId } = useParams();

	// Refs
	const mapRef = useRef<MapRef>(null);
	const drawRef = useRef<MapboxDraw | null>(null);

	// Parse polygon coordinates or use empty array if none exist
	const parsedCoords = useMemo(() => {
		try {
			return polygons?.coordinates ? JSON.parse(polygons.coordinates)[0] : [];
		} catch {
			return [];
		}
	}, [polygons]);

	// Check if polygon exists
	useEffect(() => {
		if (polygons?.coordinates) {
			setHasPolygon(true);
		} else {
			setHasPolygon(false);
		}
	}, [polygons]);

	// Initialize form data with existing polygon data or defaults
	const initialFormData: ProjectFormData & {
		popupDetails: { type: string };
	} = {
		id: polygons?.id || Date.now().toString(),
		name: polygons?.name || "",
		description: polygons?.description || "",
		lat: (parsedCoords.length && parsedCoords?.[0][1]) || MAP_CONFIG.initialViewState.latitude,
		lng: (parsedCoords.length && parsedCoords?.[0][0]) || MAP_CONFIG.initialViewState.longitude,
		zoom: 12,
		hideMarker: false,
		polygon: polygons || null,
		style: {
			lineColor: polygons?.style?.lineColor || "#3B82F6",
			lineWidth: polygons?.style?.lineWidth || 2,
			lineDashArray: polygons?.style?.lineDashArray || [2, 2],
			fillColor: polygons?.style?.fillColor || "#d32f2f",
			fillOpacity: polygons?.style?.fillOpacity || 0.5,
		},
		popupDetails: {
			type: polygons?.popupDetails?.type || "details",
		},
	};

	const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
	const [viewport, setViewport] = useState({
		longitude: initialFormData.lng,
		latitude: initialFormData.lat,
		zoom: 12,
	});

	/**
	 * Updates form data with new values
	 */
	const updateFormData = (key: keyof ProjectFormData, value: any) => {
		setFormData(prev => ({ ...prev, [key]: value }));

		if (key === "polygon") {
			setEditingId(value ? value.id : null);

			if (value && !formData.polygon) {
				setMode(MODES.DRAW);
			}

			if (!value) {
				setMode(MODES.VIEW);
			}
		}
	};

	/**
	 * Adds Google Satellite layer to the map
	 */
	const addGoogleSatellite = useCallback(() => {
		if (!mapRef.current) return;
		const map = mapRef.current.getMap();

		if (!map || !map.isStyleLoaded()) {
			console.log("Map not ready for Google Satellite layer");
			return;
		}

		// Check if the source already exists to prevent duplicates
		if (map.getSource("google-satellite")) return;

		try {
			map.addSource("google-satellite", {
				type: "raster",
				tiles: ["https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
				tileSize: 256,
			});

			const style = map.getStyle();
			const symbolLayer = style?.layers?.find(layer => layer.type === "symbol")?.id;
			map.addLayer(
				{
					id: "google-satellite-layer",
					type: "raster",
					source: "google-satellite",
					paint: { "raster-opacity": 1 },
				},
				symbolLayer
			);
			console.log("Google Map Layer is added");
		} catch (error) {
			console.error("Error adding Google Satellite layer:", error);
		}
	}, []);

	/**
	 * Handles creation of a new drawing on the map
	 */
	const handleCreateDrawing = useCallback(
		({ features }: { features: Feature[] }) => {
			const feature = features[0];
			if (!feature || formData.polygon) return;
			const polygon: Polygon = {
				id: `polygon-${Date.now()}`,
				name: `New ${feature.geometry.type}`,
				type: feature.geometry.type,
				coordinates: JSON.stringify(feature.geometry.coordinates[0]),
				projectId: projectId as string,
				style: {
					lineColor: "#3B82F6",
					lineWidth: 2,
					fillColor: "#d32f2f",
					fillOpacity: 0.5,
				},
				popupDetails: {
					type: "details",
				},
			};

			setFormData(prev => ({ ...prev, polygon }));
			setMode(MODES.VIEW);
		},
		[formData, projectId]
	);

	/**
	 * Handles updates to an existing drawing
	 */
	const handleUpdateDrawing = useCallback(
		(e: { features: Feature[] }) => {
			const updatedFeature = e.features[0];
			if (!updatedFeature) return;
			const updatedPolygon = {
				...formData.polygon,
				coordinates: JSON.stringify(updatedFeature.geometry.coordinates[0]),
				style: {
					...formData?.polygon?.style,
					...updatedFeature.properties?.style,
				},
			};

			updateFormData("polygon", updatedPolygon);

			setFeatures(prev => ({
				...prev,
				[updatedFeature.id]: updatedFeature,
			}));
		},
		[formData.polygon]
	);

	/**
	 * Handles deletion of drawings
	 */
	const handleDeleteDrawing = useCallback(({ features }: { features: Feature[] }) => {
		setFeatures(prev => {
			const updated = { ...prev };
			for (const f of features) delete updated[f.id];
			return updated;
		});
		setEditingId(null);
	}, []);

	/**
	 * Initiates polygon editing mode
	 */
	const handleEditPolygon = () => {
		const polygonToEdit = formData.polygon;

		// Check if draw reference is available
		if (!drawRef.current) {
			console.warn("Draw reference is not available, attempting to initialize it");
			// Try to initialize the draw tool if it's not already initialized
			initializeDrawTool();

			// Set a delay before attempting to edit to give time for initialization
			setTimeout(() => {
				if (drawRef.current) {
					activateEditMode(polygonToEdit);
				} else {
					console.error("Failed to initialize draw tool for editing");
					alert("Unable to edit polygon. Please try closing and reopening the editor.");
				}
			}, 1000);
			return;
		}

		// Draw reference exists, check if it's attached to the map
		const map = mapRef.current?.getMap();
		if (!map?.hasControl(drawRef.current)) {
			console.warn("Draw control is detached, attempting to reattach");

			// Try to re-add the control
			if (map) {
				if (drawRef.current) {
					// Try to add the control back
					map.addControl(drawRef.current);

					// Set a delay before attempting to edit
					setTimeout(() => {
						//@ts-expect-error: The 'hasControl' method expects a specific type
						if (map.hasControl(drawRef.current)) {
							activateEditMode(polygonToEdit);
						} else {
							console.error("Failed to reattach draw control");
							alert("Unable to edit polygon. Please try closing and reopening the editor.");
						}
					}, 500);
				} else {
					// If draw reference was lost somehow, re-initialize
					initializeDrawTool();
					setTimeout(() => activateEditMode(polygonToEdit), 1000);
				}
			}
			return;
		}

		// If everything is OK, activate edit mode directly
		activateEditMode(polygonToEdit);
	};
	const activateEditMode = (polygonToEdit: any) => {
		if (!polygonToEdit || !drawRef.current || !mapRef.current) {
			console.error("Cannot activate edit mode: missing required references");
			return;
		}

		try {
			const map = mapRef.current.getMap();

			// Ensure the polygon feature exists in the draw instance
			const features = drawRef.current.getAll().features;
			const featureExists = features.some(f => f.id === polygonToEdit.id);

			if (!featureExists) {
				console.log("Polygon feature not found in draw, adding it now");
				// Add the polygon to the draw instance if it doesn't exist
				try {
					const coords = JSON.parse(polygonToEdit.coordinates);
					const feature = {
						id: polygonToEdit.id,
						type: "Feature",
						geometry: { type: "Polygon", coordinates: [coords] },
						properties: {
							name: polygonToEdit.name,
							style: polygonToEdit.style,
						},
					};
					// @ts-expect-error: The 'add' method expects a specific type
					drawRef.current.add(feature);
				} catch (err) {
					console.error("Failed to add polygon to draw instance:", err);
					return;
				}
			}

			// Set editor state
			setMode(MODES.EDIT);
			setEditingId(polygonToEdit.id);

			// Change to direct_select mode
			drawRef.current.changeMode("direct_select", {
				featureId: polygonToEdit.id,
			});

			// Zoom to polygon
			try {
				const coordinates = JSON.parse(polygonToEdit.coordinates);
				// Calculate bounds to focus on the polygon
				const bounds = coordinates.reduce(
					(acc: number[], coord: number[]) => [
						Math.min(acc[0], coord[0]),
						Math.min(acc[1], coord[1]),
						Math.max(acc[2], coord[0]),
						Math.max(acc[3], coord[1]),
					],
					[Infinity, Infinity, -Infinity, -Infinity]
				);

				map.fitBounds(
					[
						[bounds[0], bounds[1]],
						[bounds[2], bounds[3]],
					],
					{ padding: 100, duration: 1000 }
				);
			} catch (error) {
				console.error("Error calculating polygon bounds:", error);
			}
		} catch (error) {
			console.error("Error during editing:", error);
		}
	};

	/**
	 * Deletes a polygon from the database
	 */
	const handleDeletePolygon = async () => {
		if (!formData.polygon) return;
		setSavingPolygon(true);
		clearDrawnFeatures();

		try {
			const res = await fetch(`/api/project-polygon/${formData.polygon.id}`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
			});

			if (!res.ok) throw new Error("Failed to delete polygon");
			setFormData(prev => ({ ...prev, polygon: null }));
			setFeatures(prev => {
				const updated = { ...prev };
				formData.polygon && delete updated[formData.polygon.id];
				return updated;
			});
		} catch (err) {
			console.error("Error deleting polygon:", err);
		} finally {
			updateFormData("polygon", null);
			setSavingPolygon(false);
		}

		setShowEditor(false);
		setMode(MODES.VIEW);
	};

	/**
	 * Validates polygon data before saving
	 */
	const validatePolygonData = (data: any | null) => {
		if (!data) return false;

		// Check if we have a valid polygon with coordinates
		if (!data.geometry || !data.geometry.coordinates) return false;

		// Basic validation of style properties
		const { style } = data.properties || {};
		if (style) {
			if (
				style.lineWidth <= 0 ||
				(style.fillOpacity !== undefined && (style.fillOpacity < 0 || style.fillOpacity > 1))
			) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Saves polygon to the database
	 */
	const handleSavePolygon = async () => {
		if (!formData.polygon) {
			console.error("No polygon data to save");
			return;
		}

		// Check if draw is ready using your existing state
		if (!isDrawReady) {
			console.error("Drawing reference is not available");
			alert("Unable to save: The drawing tool is not ready. Please try again.");
			return;
		}

		let updated;

		try {
			updated = drawRef?.current?.getAll().features.find(f => f.id === formData.polygon?.id);
		} catch (error) {
			console.error("Error accessing draw features:", error);
			alert(`Could not access drawing data: ${error || "Unknown error"}`);
			return;
		}

		if (!updated) {
			console.error("Could not find the polygon in the current drawing");
			return;
		}

		if (!validatePolygonData(updated)) {
			console.error("Invalid polygon data");
			return;
		}
		setSavingPolygon(true);

		const polygonToSave = {
			...formData.polygon,
			coordinates: JSON.stringify(updated.geometry.type === "Polygon" ? updated.geometry.coordinates[0] : []),
		};

		try {
			// Check if this is a new polygon or an existing one
			const isNewPolygon = !polygons?.id;
			let res;
			if (isNewPolygon) {
				// Make sure project ID is included for new polygons
				console.log("Saving new polygon with data:", {
					...polygonToSave,
					coordinates: "...", // Don't log the full coordinates
					style: polygonToSave.style ? "Present" : "Missing",
					popupDetails: polygonToSave.popupDetails ? "Present" : "Missing",
				});

				// Create a new polygon
				res = await fetch("/api/project-polygon", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(polygonToSave),
				});

				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					throw new Error(`Failed to create polygon: ${res.status} ${res.statusText} - ${errorData?.error || ""}`);
				}
			} else {
				// Update an existing polygon
				res = await fetch(`/api/project-polygon/${polygonToSave.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(polygonToSave),
				});

				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					throw new Error(`Failed to update polygon: ${res.status} ${res.statusText} - ${errorData?.error || ""}`);
				}
			}

			// Process the response
			const result = await res.json();

			if (result.data) {
				// Update the polygon with the data from the server
				updateFormData("polygon", result.data);

				// Show success message
				alert(isNewPolygon ? "Polygon created successfully!" : "Polygon updated successfully!");

				// Close the editor and update UI
				setShowEditor(false);
				setMode(MODES.VIEW);
			} else {
				throw new Error("API response did not include polygon data");
			}
		} catch (err) {
			console.error("Error saving polygon:", err);
			alert(`Error saving polygon: ${err || "Unknown error"}`);
		} finally {
			setSavingPolygon(false);
		}
	};

	/**
	 * Updates polygon metadata without modifying the shape
	 */
	const handleFormDataUpdates = async (polygonId: string, updates: Partial<Polygon>) => {
		if (!formData.polygon || polygonId !== formData.polygon.id) return;

		const updatedPolygon = {
			...formData.polygon,
			...updates,
		};

		updateFormData("polygon", updatedPolygon);

		// Update visual map feature with the new styles
		if (updates.style && drawRef.current) {
			try {
				// Update the feature in MapboxDraw to reflect new styles
				const currentFeatures = drawRef.current.getAll().features;
				const featureToUpdate = currentFeatures.find(f => f.id === polygonId);

				if (featureToUpdate) {
					// Update the feature's properties with the new style
					featureToUpdate.properties = {
						...featureToUpdate.properties,
						style: updatedPolygon.style,
					};

					// Also update our local features state
					// @ts-expect-error: The 'setFeatures' function expects a specific type
					setFeatures(prev => ({
						...prev,
						[polygonId]: {
							...prev[polygonId],
							properties: featureToUpdate.properties,
						},
					}));

					// Update the Source component's style properties
					updateMapDisplayStyle(updatedPolygon.style);
				}
			} catch (err) {
				console.error("Error updating feature style:", err);
			}
		}
	};

	/**
	 * Update the map display style for the polygon
	 */
	const updateMapDisplayStyle = (style: any) => {
		if (!mapRef.current) return;

		const map = mapRef.current.getMap();
		if (!map || !map.isStyleLoaded()) return;

		// Update fill layer
		if (map.getLayer("polygon-fill")) {
			map.setPaintProperty("polygon-fill", "fill-color", style.fillColor || "#d32f2f");
			map.setPaintProperty("polygon-fill", "fill-opacity", style.fillOpacity || 0.5);
		}

		// Update outline layer
		if (map.getLayer("polygon-outline")) {
			map.setPaintProperty("polygon-outline", "line-color", style.lineColor || "#3B82F6");
			map.setPaintProperty("polygon-outline", "line-width", style.lineWidth || 2);
		}
	};

	/**
	 * Checks if the polygon has been modified
	 */
	const isPolygonChanged = () => {
		// First check if there are metadata changes (this doesn't require drawRef)
		const hasMetaChanges = checkForMetadataChanges();

		// If we already know there are metadata changes, we can return early
		if (hasMetaChanges) return true;

		// Otherwise, check for geometry changes only if we have a valid drawRef
		return checkForGeometryChanges();
	};

	/**
	 * Checks if polygon metadata has changed (name, description, styles, etc.)
	 */
	const checkForMetadataChanges = () => {
		if (!formData.polygon || !polygons) return false;

		return (
			formData.polygon.name !== polygons.name ||
			formData.polygon.description !== polygons.description ||
			JSON.stringify(formData.polygon.style) !== JSON.stringify(polygons.style) ||
			JSON.stringify(formData.polygon.popupDetails) !== JSON.stringify(polygons.popupDetails)
		);
	};

	/**
	 * Checks if polygon geometry has changed
	 */
	const checkForGeometryChanges = () => {
		// If we don't have a valid drawRef or polygon, we can't check for geometry changes
		if (!drawRef?.current || !formData.polygon) return false;

		// Make sure drawRef.current.getAll is a function before calling it
		if (typeof drawRef.current.getAll !== "function") {
			console.warn("drawRef.current.getAll is not a function");
			return false;
		}

		try {
			// Get the drawn feature
			const drawnFeature = drawRef.current.getAll()?.features?.find(f => f.id === formData.polygon?.id);

			// Check if the geometry is valid
			const drawnCoords = drawnFeature?.geometry.type === "Polygon" ? drawnFeature.geometry.coordinates?.[0] : null;

			// If we don't have valid coordinates, no geometry changes
			if (!drawnCoords) return false;

			// New polygon — no original polygon from props
			if (!polygons?.coordinates) return true;

			// Compare coordinates
			const savedCoords = JSON.parse(polygons.coordinates);
			return JSON.stringify(drawnCoords) !== JSON.stringify(savedCoords);
		} catch (error) {
			console.error("Error checking geometry changes:", error);
			return false;
		}
	};

	/**
	 * Clears drawn features from the map
	 */
	const clearDrawnFeatures = () => {
		if (!mapRef.current) return;

		try {
			const map = mapRef.current.getMap();
			if (!map || !map.isStyleLoaded()) return;

			// Remove layers first
			if (map.getLayer("polygon-fill")) {
				map.removeLayer("polygon-fill");
			}
			if (map.getLayer("polygon-outline")) {
				map.removeLayer("polygon-outline");
			}

			// Then remove the source
			if (map.getSource("polygon-source")) {
				map.removeSource("polygon-source");
			}
		} catch (error) {
			console.error("Error clearing drawn features:", error);
		}
	};

	/**
	 * Initialize MapboxDraw instance
	 */
	const initializeDrawTool = useCallback(() => {
		if (!mapRef.current) return;

		const map = mapRef.current.getMap();
		if (!map || !map.isStyleLoaded()) {
			console.log("Map not ready for draw initialization");
			return;
		}

		// Remove existing draw control if present
		if (drawRef.current && map.hasControl(drawRef.current)) {
			map.removeControl(drawRef.current);
		}

		console.log("Initializing draw control");
		const draw = new MapboxDraw({
			displayControlsDefault: false,
			controls: { polygon: mode === MODES.DRAW, trash: true },
		});

		map.addControl(draw);
		drawRef.current = draw;
		setIsDrawReady(true);

		// Add existing polygon to map if one exists
		if (formData.polygon) {
			try {
				const coords = JSON.parse(formData.polygon.coordinates);
				const feature: Feature = {
					id: formData.polygon.id,
					type: "Feature",
					geometry: { type: "Polygon", coordinates: [coords] },
					properties: {
						name: formData.polygon.name,
						style: {
							id: formData.polygon.style?.id || `style-${formData.polygon.id}`,
							fillColor: formData.polygon.style?.fillColor || "#d32f2f",
							hoverFillColor: formData.polygon.style?.hoverFillColor || null,
							fillOpacity: formData.polygon.style?.fillOpacity || 0.5,
							hoverFillOpacity: formData.polygon.style?.hoverFillOpacity || null,
							lineColor: formData.polygon.style?.lineColor || "#3B82F6",
							lineWidth: formData.polygon.style?.lineWidth || 2,
							lineDashArray: formData.polygon.style?.lineDashArray || [2, 2],
							polygonId: formData.polygon.id,
							lineOpacity: formData.polygon.style?.lineOpacity || 1,
							createdAt: formData.polygon.style?.createdAt || new Date(),
							updatedAt: formData.polygon.style?.updatedAt || new Date(),
						},
					},
				};

				// Add feature to draw instance
				// @ts-expect-error: The 'add' method expects a specific type, but we are passing a custom feature object.
				draw.add(feature);
				draw.changeMode("simple_select", { featureIds: [feature.id] });
				setFeatures({ [feature.id]: feature });
				setEditingId(feature.id);

				// Fit map to polygon bounds
				const bounds = coords.reduce(
					(acc: number[], coord: number[]) => [
						Math.min(acc[0], coord[0]),
						Math.min(acc[1], coord[1]),
						Math.max(acc[2], coord[0]),
						Math.max(acc[3], coord[1]),
					],
					[Infinity, Infinity, -Infinity, -Infinity]
				);

				map.fitBounds(
					[
						[bounds[0], bounds[1]],
						[bounds[2], bounds[3]],
					],
					{
						padding: 100,
						duration: 1000,
					}
				);

				// Update map display with polygon styles
				updateMapDisplayStyle(formData.polygon.style);
			} catch (err) {
				console.error("Failed to parse polygon coordinates", err);
			}
		}

		// Set up map event listeners
		map.on("draw.create", handleCreateDrawing);
		map.on("draw.update", handleUpdateDrawing);
		map.on("draw.delete", handleDeleteDrawing);
	}, [formData.polygon, handleCreateDrawing, handleDeleteDrawing, handleUpdateDrawing, mode]);

	// Clean up map layers on unmount
	useEffect(() => {
		return () => {
			const map = mapRef.current?.getMap();

			if (!map) return;

			// Clean up event listeners
			map.off("draw.create", handleCreateDrawing);
			map.off("draw.update", handleUpdateDrawing);
			map.off("draw.delete", handleDeleteDrawing);

			// Remove layers and sources
			if (map.getLayer("polygon-fill")) map.removeLayer("polygon-fill");
			if (map.getLayer("polygon-outline")) map.removeLayer("polygon-outline");
			if (map.getSource("polygon-source")) map.removeSource("polygon-source");

			// Clean up draw control
			if (drawRef.current && map.hasControl(drawRef.current)) {
				map.removeControl(drawRef.current);
			}
		};
	}, [handleCreateDrawing, handleDeleteDrawing, handleUpdateDrawing]);

	// Initialize MapboxDraw and set up event listeners when map and style are loaded
	useEffect(() => {
		if (mapLoaded && styleLoaded && !mapInitialized && showEditor) {
			// Let the map styles finish loading before initializing the draw tool
			const timer = setTimeout(() => {
				initializeDrawTool();
				setMapInitialized(true);
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [mapLoaded, styleLoaded, mapInitialized, showEditor, initializeDrawTool]);

	// Re-initialize draw tool when entering edit mode
	useEffect(() => {
		if (showEditor && mapLoaded && styleLoaded) {
			// Use a timeout to ensure the map is fully loaded
			const timer = setTimeout(() => {
				console.log("Initializing draw tool after editor opened");
				initializeDrawTool();
				setMapInitialized(true);
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [showEditor, mapLoaded, styleLoaded, initializeDrawTool]);

	// Update draw mode when mode or editingId changes
	useEffect(() => {
		const draw = drawRef.current;
		const map = mapRef.current?.getMap();
		if (!draw || !map?.hasControl(draw)) return;

		console.log("Updating draw mode to", mode);
		switch (mode) {
			case MODES.DRAW:
				draw.changeMode("draw_polygon");
				break;
			case MODES.EDIT:
				if (editingId) draw.changeMode("direct_select", { featureId: editingId });
				break;
			default:
				draw.changeMode("simple_select");
		}
	}, [mode, editingId]);

	// Check if polygon has been modified
	useEffect(() => {
		const changed = isPolygonChanged();
		setCanSave(changed);
	}, [formData, features]);

	// Add Google Satellite layer when map is ready
	useEffect(() => {
		if (mapLoaded && styleLoaded) {
			const timer = setTimeout(() => {
				addGoogleSatellite();
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [mapLoaded, styleLoaded, addGoogleSatellite]);

	// A separate effect to check if draw reference is lost and reinitialize if needed
	useEffect(() => {
		// Only check when editor is open and we've already initialized once
		if (showEditor && mapInitialized && mapRef.current?.getMap()) {
			const checkTimer = setInterval(() => {
				// If we have a map but no draw control or it's not attached, reinitialize
				const map = mapRef.current?.getMap();
				if (map && (!drawRef.current || !map.hasControl(drawRef.current))) {
					console.log("Draw control lost or detached, reinitializing");
					initializeDrawTool();
				}
			}, 5000); // Check every 5 seconds

			return () => clearInterval(checkTimer);
		}
	}, [showEditor, mapInitialized, initializeDrawTool]);

	return (
		<Box>
			{!showEditor ? (
				<Box>
					{/* Polygon info card when not in edit mode */}
					{hasPolygon && (
						<Card sx={{ mb: 2 }}>
							<CardContent>
								<Typography variant="h6">Project Polygon</Typography>
								<Typography variant="body2" color="text.secondary">
									Name: {polygons.name}
								</Typography>
							</CardContent>
						</Card>
					)}
					{/* Button to enter edit mode */}
					<Button
						variant="contained"
						onClick={() => {
							setShowEditor(true);
							setMapInitialized(false); // Reset initialization flag to trigger re-initialization

							// Reset states to ensure clean start
							setIsDrawReady(false);
							setFeatures({});
						}}>
						{hasPolygon ? "Edit Polygon" : "Add Polygon"}
					</Button>
				</Box>
			) : (
				// Polygon Editor UI
				<Box
					sx={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000, display: "flex" }}>
					{/* Map Area */}
					<Box sx={{ width: "70%" }}>
						<Map
							ref={mapRef}
							initialViewState={viewport}
							mapStyle="mapbox://styles/hanyrabah/clreumh3d00e501pid3g47uqu"
							mapboxAccessToken={MAPBOX_TOKEN}
							onLoad={e => {
								console.log("Map loaded event fired");
								setMapLoaded(true);

								// Try to add satellite immediately on load
								setTimeout(() => {
									if (e.target && e.target.isStyleLoaded()) {
										console.log("Adding Google layer on initial map load");
										addGoogleSatellite();
									}
								}, 500);
							}}
							onStyleData={() => {
								console.log("Map style data loaded");
								setStyleLoaded(true);

								// Try adding the layer when style data loads
								if (mapRef.current?.getMap()) {
									setTimeout(() => addGoogleSatellite(), 300);
								}
							}}
							onMove={e => setViewport(e.viewState)}>
							<MapSearchBox flyTo={center => mapRef.current?.flyTo({ center, zoom: 14, duration: 2000 })} />

							{/* Polygon display layer */}
							{mapLoaded && styleLoaded && (
								<ErrorBoundary fallback={<div>Error loading map source</div>}>
									<Source
										id="polygon-source"
										type="geojson"
										data={{ type: "FeatureCollection", features: Object.values(features) }}>
										<Layer
											id="polygon-fill"
											type="fill"
											paint={{
												"fill-color": formData.polygon?.style?.fillColor || "#d32f2f",
												"fill-opacity": formData.polygon?.style?.fillOpacity || 0.5,
											}}
										/>
										<Layer
											id="polygon-outline"
											type="line"
											paint={{
												"line-color": formData.polygon?.style?.lineColor || "#3B82F6",
												"line-width": formData.polygon?.style?.lineWidth || 2,
											}}
										/>
									</Source>
								</ErrorBoundary>
							)}
						</Map>
					</Box>

					{/* Sidebar with Polygon Editor */}
					<Box sx={{ width: "30%", p: 2, overflowY: "auto", bgcolor: "grey.50" }}>
						<Typography variant="h5" gutterBottom>
							Polygon Editor
						</Typography>

						{/* Draw polygon button if no polygon exists */}
						{!formData.polygon && (
							<Box>
								<Button variant="outlined" onClick={() => setMode(MODES.DRAW)}>
									Draw Polygon
								</Button>
							</Box>
						)}

						{/* Polygon form when a polygon exists */}
						{formData.polygon && (
							<Box>
								<Typography variant="body2">{formData.polygon.name}</Typography>
								<Typography variant="body2">{String(formData.polygon.type)}</Typography>

								{/* Delete button for existing polygons */}
								{polygons?.coordinates && (
									<Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleDeletePolygon} sx={{ mb: 2 }}>
										Delete
									</Button>
								)}

								{/* Polygon form component */}
								<PolygonForm
									polygon={formData.polygon}
									EditPolygonPoints={handleEditPolygon}
									handleFormDataUpdates={handleFormDataUpdates}
									isEditing={mode === MODES.EDIT}
								/>

								{/* Action buttons */}
								<Box sx={{ display: "flex", gap: 2, mt: 3 }}>
									<Button
										fullWidth
										onClick={() => {
											try {
												clearDrawnFeatures();
												setShowEditor(false);
												setCanSave(false);
												setEditingId(null);
												setMode(MODES.VIEW);
												setFeatures({});

												// Clear polygon state if unsaved
												if (!polygons?.coordinates && formData.polygon) {
													updateFormData("polygon", null);
												}

												// Safely remove the draw control
												if (drawRef.current && mapRef.current?.getMap()?.hasControl(drawRef.current)) {
													mapRef.current.getMap().removeControl(drawRef.current);
													drawRef.current = null;
												}
											} catch (error) {
												console.error("Error handling cancel:", error);
											}
										}}
										variant="outlined">
										Cancel
									</Button>
									<Button
										fullWidth
										variant="contained"
										onClick={handleSavePolygon}
										disabled={!canSave || savingPolygon || !isDrawReady}>
										{savingPolygon ? <CircularProgress size={24} /> : "Save Changes"}
									</Button>
								</Box>
							</Box>
						)}
					</Box>
				</Box>
			)}
		</Box>
	);
}
