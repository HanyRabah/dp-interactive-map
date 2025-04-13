"use client";
import Loader from "@/components/Loader";
import { MAP_CONFIG, MAPBOX_TOKEN } from "@/constants/mapConstants";
import { Project } from "@/types/project";
import { CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Map, { MapRef } from "react-map-gl";

// Dynamic imports
const ProjectPolygons = dynamic(() => import("@/components/GlobeProjects/ProjectPolygons"), { ssr: false });
const ProjectsMarker = dynamic(() => import("@/components/GlobeProjects/ProjectMarker"), { ssr: false });
const ClusteredMarkers = dynamic(() => import("@/components/GlobeProjects/ClusteredMarkers"), { ssr: false });
const MeteorBackground = dynamic(() => import("@/components/GlobeMap/MeteorBackground"), { ssr: false });

interface Client {
	id: string;
	name: string;
	slug: string;
	projects: Project[];
}

const ClientMap = () => {
	const params = useParams();
	const mapRef = useRef<MapRef>(null);
	const [client, setClient] = useState<Client | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [showMarkers, setShowMarkers] = useState(false);
	const [showPolygons, setShowPolygons] = useState(false);
	const [showMeteor, setShowMeteor] = useState(true);
	const [selectedPOI, setSelectedPOI] = useState<any>(null);
	const [routeInfo, setRouteInfo] = useState<any>(null);
	const [zoomLevel, setZoomLevel] = useState<number>(2);
	const prevZoomRef = useRef<number | null>(null);

	useEffect(() => {
		const fetchClient = async () => {
			try {
				const response = await fetch(`/api/clients/${params.clientSlug}`);
				if (!response.ok) throw new Error("Failed to fetch client data");

				const data = await response.json();
				setClient(data);

				// Only show visible projects
				const visibleProjects = data.projects.filter((project: Project) => project.isVisible);
				if (visibleProjects.length > 0) {
					setShowMarkers(true);
				}
			} catch (error) {
				console.error("Error fetching client:", error);
			} finally {
				setLoading(false);
			}
		};

		if (params.clientSlug) {
			fetchClient();
		}
	}, [params.clientSlug]);

	const handleZoomChange = React.useCallback(() => {
		const mapboxMap = mapRef?.current?.getMap();
		if (!mapboxMap) return;

		const currentZoom = mapboxMap.getZoom();
		setZoomLevel(currentZoom);

		if (prevZoomRef.current !== null) {
			const isZoomingOut = currentZoom < prevZoomRef.current;

			if (isZoomingOut) {
				if (currentZoom < 9 && selectedProject) {
					setSelectedProject(null);
				}
			}
		}

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

	const handleZoomOut = React.useCallback(() => {
		const map = mapRef?.current;
		if (!map) return;

		map.flyTo({
			center: [MAP_CONFIG.initialViewState.longitude, MAP_CONFIG.initialViewState.latitude],
			zoom: 2,
			duration: 3000,
		});

		handleZoomChange();
		setSelectedProject(null);
	}, [handleZoomChange]);

	const handleSelectProject = React.useCallback(
		(id: string) => {
			if (!client?.projects) return;

			const project = client.projects.find(p => p.id === id);
			const map = mapRef?.current;

			if (!project || !map) return;

			map.flyTo({
				center: [project.lng, project.lat],
				zoom: 14,
				duration: 3000,
			});

			setSelectedProject(project);
		},
		[client]
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<CircularProgress />
			</div>
		);
	}

	if (!client) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-xl">Client not found</p>
			</div>
		);
	}

	return (
		<div className="m-0" id="map-page">
			{showMeteor && <MeteorBackground />}
			<Loader showLoader={loading} />

			<div className="absolute top-0 h-screen w-full z-0">
				<Map
					ref={mapRef}
					initialViewState={MAP_CONFIG.initialViewState}
					mapStyle="mapbox://styles/mapbox/streets-v12"
					mapboxAccessToken={MAPBOX_TOKEN}
					onZoom={handleZoomChange}
					projection={{ name: "globe" }}>
					{selectedProject && (
						<ProjectPolygons project={selectedProject} sendSelectedPOI={setSelectedPOI} sendRouteInfo={setRouteInfo} />
					)}

					{showMarkers && (
						<ClusteredMarkers
							projects={client.projects}
							zoom={zoomLevel}
							handleClick={handleSelectProject}
							onGroupClick={center => {
								if (!mapRef.current) return;
								mapRef.current.flyTo({
									center,
									zoom: 10,
									duration: 3000,
								});
							}}
						/>
					)}

					{/* Map Controls and other components can be added here */}
				</Map>
			</div>
		</div>
	);
};

export default ClientMap;
