//
"use client";

import { MAP_CONFIG, MAPBOX_TOKEN } from "@/constants/mapConstants";
import { Feature, Mode, MODES } from "@/types/drawMap";
import { Polygon } from "@/types/projects";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, MapRef, Source } from "react-map-gl";
import { ProjectFormData } from "../DrawMap";
import PolygonForm from "../DrawMap/PolygonForm";
import MapSearchBox from "./MapSearchBox";

export default function DrawPolygon({ polygons }: { polygons?: any }) {
	const [showEditor, setShowEditor] = useState(false);
	const [features, setFeatures] = useState<Record<string, Feature>>({});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [mode, setMode] = useState<Mode>(MODES.VIEW);
	const [drawKey, setDrawKey] = useState(0);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [savingPolygon, setSavingPolygon] = useState(false);
	const [canSave, setCanSave] = useState(false);
	const [isDrawReady, setIsDrawReady] = useState(false);

	const mapRef = useRef<MapRef>(null);
	const drawRef = useRef<MapboxDraw | null>(null);

	const parsedCoords = useMemo(() => {
		try {
			return polygons?.coordinates ? JSON.parse(polygons.coordinates)[0] : [];
		} catch {
			return [];
		}
	}, [polygons]);

	// const coords = polygons?.coordinates && JSON.parse(polygons.coordinates)[0];
	const hasPolygon = parsedCoords?.length > 0;

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
		popupDetails: {
			type: polygons?.popupDetails?.type || "details",
		},
	};

	const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
	const [viewport, setViewport] = useState({
		longitude: Number(initialFormData.lng),
		latitude: Number(initialFormData.lat),
		zoom: 12,
	});

	const updateFormData = (key: keyof ProjectFormData, value: any) => {
		setFormData(prev => ({ ...prev, [key]: value }));
		if (key === "polygon") {
			setEditingId(value ? value.id : null);
			if (value && !formData.polygon) {
				setMode(MODES.DRAW);
				setDrawKey(prev => prev + 1);
			}

			if (!value) {
				setMode(MODES.VIEW);
			}
		}
	};

	const addGoogleSatellite = useCallback(() => {
		if (!mapRef.current) return;
		const map = mapRef.current.getMap();
		if (map.getSource("google-satellite")) return;

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
	}, []);

	const handleCreateDrawing = useCallback(
		({ features }: { features: Feature[] }) => {
			const feature = features[0];
			if (!feature || formData.polygon) return;
			const polygon: Polygon = {
				id: `polygon-${Date.now()}`,
				name: `New ${feature.geometry.type}`,
				type: feature.geometry.type,
				coordinates: JSON.stringify(feature.geometry.coordinates[0]),
				projectId: formData.id,
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
		[formData]
	);

	const handleUpdateDrawing = useCallback(
		(e: { features: Feature[] }) => {
			const updatedFeature = e.features[0];
			console.log("Updated Feature:", updatedFeature);
			if (!updatedFeature) return;
			const updatedPolygon = {
				...formData.polygon,
				coordinates: JSON.stringify(updatedFeature.geometry.coordinates[0]),
				style: {
					...formData.polygon?.style,
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

	const handleDeleteDrawing = useCallback(({ features }: { features: Feature[] }) => {
		setFeatures(prev => {
			const updated = { ...prev };
			for (const f of features) delete updated[f.id];
			return updated;
		});
		setEditingId(null);
	}, []);

	const handleEditPolygon = () => {
		const polygonToEdit = formData.polygon;
		const draw = drawRef.current;
		const map = mapRef.current?.getMap();

		if (!polygonToEdit || !draw || !map?.hasControl(draw)) {
			console.warn("Cannot edit: drawRef is invalid or detached");
			return;
		}

		try {
			setMode(MODES.EDIT);
			setEditingId(polygonToEdit.id);

			draw.changeMode("direct_select", {
				featureId: polygonToEdit.id,
			});

			const coordinates = JSON.parse(polygonToEdit.coordinates);
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
			console.error("Error during editing:", error);
		}
	};

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

	const validataPolygonData = (data: any | null) => {
		if (!data) return false;
		const { coordinates } = data.geometry;
		const { name, description, style } = data.properties;
		if (!name || !description || !coordinates || !style) return false;
		const parsedCoords = JSON.parse(coordinates);
		if (!Array.isArray(parsedCoords) || parsedCoords.length === 0) return false;

		// check style
		if (!style.lineColor || !style.lineWidth || !style.fillColor || !style.fillOpacity) return false;
		if (style.lineWidth <= 0 || style.fillOpacity < 0 || style.fillOpacity > 1) return false;
		if (style.lineDashArray && !Array.isArray(style.lineDashArray)) return false;
		if (style.lineDashArray && style.lineDashArray.length === 0) return false;
		if (style.lineDashArray && style.lineDashArray.some(isNaN)) return false;

		return true;
	};

	const handleSavePolygon = async () => {
		if (!formData.polygon || !drawRef.current) return;

		const updated = drawRef.current.getAll().features.find(f => f.id === formData.polygon?.id);
		if (!updated) return;

		// if (!validataPolygonData(updated)) {
		// 	console.error("Invalid polygon data");
		// 	setSavingPolygon(false);
		// 	return;
		// }

		// TODO: add validation here

		setSavingPolygon(true);
		const polygonToSave = {
			...formData.polygon,
			coordinates:
				updated.geometry.type === "Polygon" && updated.geometry.coordinates
					? JSON.stringify(updated.geometry.coordinates[0])
					: "",
			style: {
				...formData.polygon.style,
				...updated.properties?.style,
				lineDashArray: [2, 2],
			},
			popUpDetails: {
				...formData.polygon.popupDetails,
				type: formData.polygon.type || "details",
				...updated.properties?.popupDetails,
			},
		};
		try {
			const res = await fetch(`/api/project-polygon/${polygonToSave.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(polygonToSave),
			});
			if (!res.ok) throw new Error("Failed to save polygon");
			updateFormData("polygon", polygonToSave);
		} catch (err) {
			console.error("Error saving polygon:", err);
		} finally {
			setSavingPolygon(false);
		}

		setFeatures(prev => ({
			...prev,
			[polygonToSave.id]: {
				...prev[polygonToSave.id],
				geometry: {
					type: "Polygon",
					coordinates: [JSON.parse(polygonToSave.coordinates)],
				},
				properties: {
					...prev[polygonToSave.id]?.properties,
					style: polygonToSave.style,
				},
			} as Feature, // Ensure the object conforms to the Feature type
		}));

		setShowEditor(false);
		setMode(MODES.VIEW);
	};

	const handlePolygonMetaUpdate = (polygonId: string, updates: Partial<Polygon>) => {
		if (!formData.polygon || polygonId !== formData.polygon.id) return;

		const updatedPolygon = {
			...formData.polygon,
			...updates,
			style: {
				...formData.polygon.style,
				...updates.style, // optional: deep merge style
			},
			popupDetails: {
				...formData.polygon.popupDetails,
				...updates.popupDetails, // optional: deep merge popup
			},
		};

		updateFormData("polygon", updatedPolygon);

		// Update visual map feature
		setFeatures(prev => ({
			...prev,
			[updatedPolygon.id]: {
				...prev[updatedPolygon.id],
				properties: {
					...prev[updatedPolygon.id]?.properties,
					...updatedPolygon,
				},
			} as Feature, // Ensure the object conforms to the Feature type
		}));
	};

	const isPolygonChanged = () => {
		if (!formData.polygon || !drawRef.current || typeof drawRef.current.getAll !== "function") return false;

		const drawnFeature = drawRef.current.getAll()?.features?.find(f => f.id === formData.polygon?.id);
		const drawnCoords = drawnFeature?.geometry?.type === "Polygon" ? drawnFeature.geometry.coordinates[0] : undefined;

		if (!drawnCoords) return false;

		// New polygon — no original polygon from props
		if (!polygons?.coordinates) return true;

		const savedCoords = JSON.parse(polygons.coordinates);

		const coordsChanged = JSON.stringify(drawnCoords) !== JSON.stringify(savedCoords);
		const metaChanged =
			formData.polygon.name !== polygons.name ||
			formData.polygon.description !== polygons.description ||
			JSON.stringify(formData.polygon.style) !== JSON.stringify(polygons.style) ||
			JSON.stringify(formData.polygon.popupDetails) !== JSON.stringify(polygons.popupDetails);

		return coordsChanged || metaChanged;
	};

	const clearDrawnFeatures = () => {
		if (mapRef.current && mapRef.current.getMap().getSource("polygon-source")) {
			mapRef.current.getMap().removeLayer("polygon-fill");
			mapRef.current.getMap().removeLayer("polygon-outline");
			mapRef.current.getMap().removeSource("polygon-source");
		}
	};

	useEffect(() => {
		const map = mapRef.current?.getMap();
		return () => {
			if (map?.getLayer("polygon-layer")) map.removeLayer("polygon-layer");
			if (map?.getSource("polygon")) map.removeSource("polygon");
		};
	}, []);

	useEffect(() => {
		if (!mapLoaded || !mapRef.current) return;

		const draw = new MapboxDraw({
			displayControlsDefault: false,
			controls: { polygon: mode === MODES.DRAW, trash: true },
		});

		const map = mapRef.current.getMap();
		map.addControl(draw);
		drawRef.current = draw;

		if (formData.polygon) {
			try {
				const coords = JSON.parse(formData.polygon.coordinates);
				const feature: Feature = {
					id: formData.polygon.id,
					type: "Feature",
					geometry: { type: "Polygon", coordinates: [coords] },
					properties: {
						name: formData.polygon.name,
						// @ts-expect-error conflict with MapboxDraw
						style: formData.polygon.style,
					},
				};
				// @ts-expect-error extra properties
				draw.add(feature);
				draw.changeMode("simple_select", { featureIds: [feature.id] });
				setFeatures({ [feature.id]: feature });
				setEditingId(feature.id);

				// Optional: only fitBounds if this is a "first open"
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
			} catch (err) {
				console.error("Failed to parse polygon coordinates", err);
			}
		}

		map.on("draw.create", handleCreateDrawing);
		map.on("draw.update", handleUpdateDrawing);
		map.on("draw.delete", handleDeleteDrawing);

		return () => {
			if (map.hasControl(draw)) {
				map.removeControl(draw);
				drawRef.current = null;
			}
			map.off("draw.create", handleCreateDrawing);
			map.off("draw.update", handleUpdateDrawing);
			map.off("draw.delete", handleDeleteDrawing);
		};
	}, [mapLoaded, mode]);

	useEffect(() => {
		const draw = drawRef.current;
		if (!draw || !mapRef.current?.getMap().hasControl(draw)) return;

		switch (mode) {
			case MODES.DRAW:
				draw.changeMode("draw_polygon");
				break;
			case MODES.EDIT:
				if (editingId) draw.changeMode("direct_select", { featureId: editingId });
				break;
			default:
				draw.changeMode("simple_select"); // ✅ safe now
		}
	}, [mode, editingId, showEditor]);

	useEffect(() => {
		const changed = isPolygonChanged();
		setCanSave(changed);
	}, [formData, features]); // or [formData, drawKey, editingId]

	useEffect(() => {
		if (drawRef.current && typeof drawRef.current.getAll === "function") {
			setIsDrawReady(true);
		}
	}, [drawRef.current]);

	return (
		<Box>
			{!showEditor ? (
				<Box>
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
					<Button
						variant="contained"
						onClick={() => {
							setShowEditor(true);

							// Refresh the drawn polygon to ensure it's the latest
							if (formData.polygon) {
								const coords = JSON.parse(formData.polygon.coordinates);
								const feature: Feature = {
									id: formData.polygon.id,
									type: "Feature",
									geometry: { type: "Polygon", coordinates: [coords] },
									properties: {
										name: formData.polygon.name,
										// @ts-expect-error conflict with MapboxDraw
										style: formData.polygon.style,
										popupDetails: {
											type: formData.polygon.type || "details",
											...formData.polygon.popupDetails,
										},
									},
								};
								setFeatures({ [feature.id]: feature });
							}
						}}>
						{hasPolygon ? "Edit Polygon" : "Add Polygon"}
					</Button>
				</Box>
			) : (
				<Box
					sx={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000, display: "flex" }}>
					<Box sx={{ width: "70%" }}>
						<Map
							ref={mapRef}
							initialViewState={viewport}
							mapStyle="mapbox://styles/hanyrabah/clreumh3d00e501pid3g47uqu"
							mapboxAccessToken={MAPBOX_TOKEN}
							onLoad={() => {
								setMapLoaded(true);
								addGoogleSatellite(); // Optional if you want to add satellite once here
							}}
							onMove={e => setViewport(e.viewState)}>
							<MapSearchBox flyTo={center => mapRef.current?.flyTo({ center, zoom: 14, duration: 2000 })} />

							<Source
								id="polygon-source"
								type="geojson"
								data={{ type: "FeatureCollection", features: Object.values(features) }}>
								<Layer id="polygon-fill" type="fill" paint={{ "fill-color": "#d32f2f", "fill-opacity": 0.5 }} />
								<Layer
									id="polygon-outline"
									type="line"
									paint={{ "line-color": "#3B82F6", "line-width": 2, "line-dasharray": [2, 2] }}
								/>
							</Source>
						</Map>
					</Box>

					<Box sx={{ width: "30%", p: 2, overflowY: "auto", bgcolor: "grey.50" }}>
						<Typography variant="h5" gutterBottom>
							Polygon Editor
						</Typography>
						{!formData.polygon && (
							<Box>
								<Button variant="outlined" onClick={() => setMode(MODES.DRAW)}>
									Draw Polygon
								</Button>
							</Box>
						)}
						{formData.polygon && (
							<Box>
								<Typography variant="body2">{formData.polygon.name}</Typography>
								<Typography variant="body2">{formData.polygon.type}</Typography>
								{polygons?.coordinates && (
									<Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleDeletePolygon}>
										Delete
									</Button>
								)}
								<PolygonForm
									polygon={formData.polygon}
									onStartEditing={handleEditPolygon}
									handlePolygonUpdate={handlePolygonMetaUpdate}
								/>
								<Box sx={{ display: "flex", gap: 2, mt: 3 }}>
									<Button
										fullWidth
										onClick={() => {
											clearDrawnFeatures();
											setShowEditor(false);
											setCanSave(false);
											setEditingId(null);
											setMode(MODES.VIEW);
											setFeatures({});
											setDrawKey(prev => prev + 1);

											// Clear polygon state if unsaved
											if (!polygons?.coordinates && formData.polygon) {
												updateFormData("polygon", null); // Remove the polygon from state
											}

											if (drawRef.current) {
												drawRef.current.deleteAll(); // Clear drawn features
											}
										}}
										variant="outlined">
										Cancel
									</Button>
									<Button
										fullWidth
										variant="contained"
										onClick={handleSavePolygon}
										disabled={!canSave || savingPolygon}>
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
