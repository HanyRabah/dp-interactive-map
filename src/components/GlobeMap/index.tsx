// components/GlobeMap/index.tsx
"use client";
import Loader from "@/components/Loader";
import { MAP_CONFIG, MAPBOX_TOKEN } from "@/constants/mapConstants";
import { ANIMATION_CONFIG } from "@/styles/mapStyles";
import { Project } from "@/types/project";
import { Client } from "@prisma/client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Map, { Layer, MapRef, Source } from "react-map-gl";
import { LocationBreadcrumb } from "./LocationBreadcrumb";
import MapControls from "./MapControls";
interface MapState {
	showText: boolean;
	mapLoaded: boolean;
	showGoogleLayer: boolean;
	viewState: {
		longitude: number;
		latitude: number;
		zoom: number;
	};
}

type MapAction =
	| { type: "SET_MAP_LOADED"; payload: boolean }
	| { type: "TOGGLE_TEXT"; payload: boolean }
	| { type: "TOGGLE_GOOGLE_LAYER"; payload: boolean }
	| { type: "UPDATE_VIEW_STATE"; payload: MapState["viewState"] };

// Dynamic imports
const ProjectPolygons = dynamic(() => import("@/components/GlobeProjects/ProjectPolygons"), { ssr: false });
const ClusteredMarkers = dynamic(() => import("@/components/GlobeProjects/ClusteredMarkers"), { ssr: false });
const MeteorBackground = dynamic(() => import("./MeteorBackground"), {
	ssr: false,
});

// Reducer
function mapReducer(state: MapState, action: MapAction): MapState {
	switch (action.type) {
		case "SET_MAP_LOADED":
			return { ...state, mapLoaded: action.payload };
		case "TOGGLE_TEXT":
			return { ...state, showText: action.payload };
		case "TOGGLE_GOOGLE_LAYER":
			return { ...state, showGoogleLayer: action.payload };
		case "UPDATE_VIEW_STATE":
			return { ...state, viewState: action.payload };
		default:
			return state;
	}
}

type GlobeMapProps = {
	client: Client | null;
	projects: Project[];
	projectsLoading: boolean;
	selectedProject: Project | null;
	setSelectedProject: (project: Project | null) => void;
};

const GlobeMap = ({ client, projects, projectsLoading, selectedProject, setSelectedProject }: GlobeMapProps) => {
	const mapRef = useRef<MapRef>(null);
	const [showMarkers, setShowMarkers] = useState(false);
	const [showPolygons, setShowPolygons] = useState(false);
	const [showMeteor, setShowMeteor] = useState(true);
	const [selectedPOI, setSelectedPOI] = useState<any>(null);
	const [routeInfo, setRouteInfo] = useState<any>(null);
	const prevZoomRef = useRef<number | null>(null);
	const [zoomLevel, setZoomLevel] = useState<number>(2);

	const initialViewState = {
		...MAP_CONFIG.initialViewState,
		longitude: client?.lng || MAP_CONFIG.initialViewState.longitude,
		latitude: client?.lat || MAP_CONFIG.initialViewState.latitude,
	};

	const [state, dispatch] = useReducer(mapReducer, {
		showText: true,
		mapLoaded: false,
		showGoogleLayer: true,
		viewState: initialViewState,
	});

	// Handle zoom changes
	const handleZoomChange = useCallback(() => {
		const mapboxMap = mapRef?.current?.getMap();
		if (!mapboxMap) return;

		const currentZoom = mapboxMap.getZoom();
		setZoomLevel(currentZoom);

		if (prevZoomRef.current !== null) {
			const isZoomingOut = currentZoom < prevZoomRef.current;
			const isZoomingIn = currentZoom > prevZoomRef.current;

			if (isZoomingOut) {
				// Add your zoom out specific logic here
				if (currentZoom < 9 && selectedProject) {
					setSelectedProject(null);
				}
			}
		}

		// Update prev zoom reference
		prevZoomRef.current = currentZoom;

		if (selectedProject) {
			setShowMarkers(false);
			setShowPolygons(true);
			setShowMeteor(false);
		} else {
			setShowMarkers(true);
			setShowPolygons(false);
			setShowMeteor(true);
		}
	}, [selectedProject]);

	const handleZoomOut = useCallback(() => {
		const map = mapRef?.current;
		if (!map) return;

		map.flyTo({
			center: [initialViewState.longitude, initialViewState.latitude],
			zoom: 2,
			duration: 3000,
		});

		handleZoomChange();
		setSelectedProject(null);
	}, [handleZoomChange, setSelectedProject]);

	// Layer Management Functions
	const addGoogleMapLayer = useCallback(() => {
		if (!mapRef.current) return;
		const mapboxMap = mapRef.current.getMap();

		const addLayer = () => {
			if (mapboxMap.getSource("google-satellite")) return;

			mapboxMap.addSource("google-satellite", {
				type: "raster",
				tiles: [`https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`],
				tileSize: 256,
				minzoom: 0,
				maxzoom: 20,
			});

			const style = mapboxMap.getStyle();
			const firstSymbolLayer = style?.layers?.find(layer => layer.type === "symbol")?.id;

			mapboxMap.addLayer(
				{
					id: "google-satellite-layer",
					type: "raster",
					source: "google-satellite",
					paint: {
						"raster-opacity": 1,
						"raster-fade-duration": 1000,
					},
					layout: {
						visibility: state.showGoogleLayer ? "visible" : "none",
					},
				},
				firstSymbolLayer
			);

			mapboxMap.flyTo({
				zoom: 2,
				duration: 3000,
			});
		};

		if (mapboxMap.isStyleLoaded()) {
			addLayer();
		} else {
			mapboxMap.on("style.load", addLayer);
		}
	}, [state.showGoogleLayer]);

	const toggleGoogleLayer = useCallback(() => {
		if (!mapRef.current) return;

		const mapboxMap = mapRef.current.getMap();
		const newVisibility = !state.showGoogleLayer;

		try {
			if (mapboxMap.getLayer("google-satellite-layer")) {
				mapboxMap.setLayoutProperty("google-satellite-layer", "visibility", newVisibility ? "visible" : "none");
			}

			dispatch({ type: "TOGGLE_GOOGLE_LAYER", payload: newVisibility });
		} catch (error) {
			console.error("Layer visibility error:", error);
		}
	}, [state.showGoogleLayer]);

	const handleMapLoad = useCallback(() => {
		dispatch({ type: "SET_MAP_LOADED", payload: true });
		addGoogleMapLayer();
	}, [addGoogleMapLayer]);

	const handleSelectProject = useCallback(
		(id: string) => {
			const project = projects.find(p => p.id === id);

			const map = mapRef?.current;
			if (!project || !map) return;

			map.flyTo({
				padding: 50,
				center: [project.lng, project.lat],
				zoom: 14,
				duration: 3000,
			});

			setSelectedProject(project as Project);
		},
		[projects, setSelectedProject]
	);

	const spinGlobe = useCallback(() => {
		const mapboxMap = mapRef?.current?.getMap();
		const zoom = mapboxMap?.getZoom();

		if (zoom && zoom < ANIMATION_CONFIG.MAX_SPIN_ZOOM) {
			let distancePerSecond = 360 / ANIMATION_CONFIG.SECONDS_PER_REVOLUTION;

			if (zoom > ANIMATION_CONFIG.SLOW_SPIN_ZOOM) {
				const zoomDif =
					(ANIMATION_CONFIG.MAX_SPIN_ZOOM - zoom) / (ANIMATION_CONFIG.MAX_SPIN_ZOOM - ANIMATION_CONFIG.SLOW_SPIN_ZOOM);
				distancePerSecond *= zoomDif;
			}

			const center = mapboxMap?.getCenter() || { lat: 0, lng: 0 };
			center.lng -= distancePerSecond;

			mapboxMap?.easeTo({
				center,
				duration: 6000,
				easing: n => n,
			});
		}
	}, []);

	const handleMapClick = useCallback((e: mapboxgl.MapLayerMouseEvent) => {
		// Only clear selection if clicking outside polygons
		if (!e.features?.length) {
			//setSelectedProject(null);
		}
	}, []);

	const handleCountryClick = useCallback((center: [number, number]) => {
		const map = mapRef?.current;
		if (!map) return;

		map.flyTo({
			center: center,
			zoom: 10,
			duration: 3000,
		});
	}, []);

	useEffect(() => {
		const mapboxMap = mapRef?.current?.getMap();
		if (!mapboxMap) return;

		mapboxMap.on("zoom", handleZoomChange);
		handleZoomChange();

		return () => {
			mapboxMap.off("zoom", handleZoomChange);
		};
	}, [handleZoomChange]);

	useEffect(() => {
		if (selectedProject) {
			const map = mapRef?.current;
			if (!map) return;

			map.flyTo({
				center: [selectedProject.lng, selectedProject.lat],
				zoom: selectedProject.zoom,
				duration: 3000,
			});
		}
	}, [selectedProject]);

	useEffect(() => {
		if (projects.length > 0) {
			setShowMarkers(true);
		}
	}, [setShowMarkers, projects]);

	// update map center when client is loaded
	useEffect(() => {
		if (client && mapRef.current) {
			const map = mapRef.current.getMap();
			map.flyTo({
				center: [client.lng, client.lat],
				zoom: 2,
				duration: 3000,
			});
		}
	}, [client]);

	return (
		<div className="m-0" id="map-page">
			{showMeteor && <MeteorBackground />}
			<Loader showLoader={projectsLoading} />
			<div className="absolute top-0 h-screen w-full z-0">
				<Map
					ref={mapRef}
					initialViewState={initialViewState}
					mapStyle="mapbox://styles/hanyrabah/clreumh3d00e501pid3g47uqu"
					mapboxAccessToken={MAPBOX_TOKEN}
					onLoad={handleMapLoad}
					onIdle={spinGlobe}
					projection={{ name: "globe" }}
					onZoom={handleZoomChange}
					onClick={handleMapClick}>
					{selectedProject && (
						<Source
							id="overlay-source"
							type="geojson"
							data={{
								type: "FeatureCollection",
								features: [
									{
										type: "Feature",
										geometry: {
											type: "Polygon",
											coordinates: [
												[
													[-180, -90],
													[180, -90],
													[180, 90],
													[-180, 90],
													[-180, -90],
												],
											],
										},
									},
								],
							}}>
							<Layer
								id="overlay-layer-bg"
								type="fill"
								paint={{
									"fill-color": "#000",
									"fill-opacity": 0.4, // Adjust opacity as needed
								}}
							/>
						</Source>
					)}
					{selectedProject && (
						<ProjectPolygons project={selectedProject} sendSelectedPOI={setSelectedPOI} sendRouteInfo={setRouteInfo} />
					)}

					{/* {showMarkers && <ProjectsMarker handleClick={handleSelectProject} projects={projects} />} */}
					{showMarkers && (
						<ClusteredMarkers
							projects={projects}
							zoom={zoomLevel || 2}
							handleClick={handleSelectProject}
							onGroupClick={handleCountryClick}
						/>
					)}
					<MapControls
						showGoogleLayer={state.showGoogleLayer}
						toggleGoogleLayer={toggleGoogleLayer}
						handleZoomOut={handleZoomOut}
						isZoomedOut={!selectedProject}
						mapBox={mapRef}
						showMarkers={showMarkers}
						showPolygons={showPolygons}
						setShowMarkers={setShowMarkers}
						setShowPolygons={setShowPolygons}
					/>

					{selectedProject && (
						<LocationBreadcrumb
							selectedProject={selectedProject}
							selectedPOI={selectedPOI}
							routeInfo={routeInfo}
							center={selectedProject ? [selectedProject.lng, selectedProject.lat] : [0, 0]}
						/>
					)}
				</Map>
			</div>
		</div>
	);
};

export default GlobeMap;
