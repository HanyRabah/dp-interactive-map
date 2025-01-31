"use client";

import Header from "@/components/Layout/Header";
import Loader from "@/components/Loader";
import { useMapData } from "@/hooks/useMapData";
import { Project } from "@/types/project";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

const MapComponent = dynamic(() => import("@/components/GlobeMap"), {
	ssr: false,
});

const GA_TRACKING_ID = "G-BVW1DHYJ1R";

export default function Home() {
	const [mapboxLoaded, setMapboxLoaded] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const { mapData: Projects, error, loading } = useMapData();

	useEffect(() => {
		// Add Mapbox CSS
		const link = document.createElement("link");
		link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
		link.rel = "stylesheet";
		document.head.appendChild(link);

		link.onload = () => {
			setMapboxLoaded(true);
		};

		return () => {
			document.head.removeChild(link);
		};
	}, []);

	if (error) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-gray-100">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Map Data</h2>
					<p className="text-gray-600">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<main className="w-full h-screen relative">
			<Script
				src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
				onLoad={() => setMapboxLoaded(true)}
				strategy="beforeInteractive"
			/>
			{/* Google Analytics */}
			<Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} strategy="afterInteractive" />
			<Script
				id="google-analytics"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${GA_TRACKING_ID}', {
					page_path: window.location.pathname,
					});
				`,
				}}
			/>
			<Loader showLoader={!mapboxLoaded} />
			<Header
				projects={Projects}
				setSelectedProject={setSelectedProject}
				selectedProject={selectedProject}
				loading={loading}
			/>
			<ToastContainer />
			<MapComponent
				projects={Projects}
				projectsLoading={loading}
				setSelectedProject={setSelectedProject}
				selectedProject={selectedProject}
			/>
		</main>
	);
}
