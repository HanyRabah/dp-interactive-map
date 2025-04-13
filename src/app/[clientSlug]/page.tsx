"use client";

import Header from "@/components/Layout/Header";
import Loader from "@/components/Loader";
import { Project } from "@/types/project";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
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
	const [loading, setLoading] = useState(true);
	const [projects, setProjects] = useState<Project[]>([]);
	const params = useParams();
	const [client, setClient] = useState(null);

	useEffect(() => {
		setLoading(true);
		const fetchClient = async () => {
			try {
				const response = await fetch(`/api/clients/${params.clientSlug}`);
				if (!response.ok) throw new Error("Failed to fetch client data");

				const data = await response.json();
				setClient(data);

				//const project = client.projects.find(p => p.id === id);
				const visibleProjects = data.projects.filter((project: Project) => project.isVisible);
				if (visibleProjects.length > 0) {
					setProjects(visibleProjects);
				} else {
					setProjects([]);
				}
			} catch (error) {
				console.error("Error fetching client:", error);
			} finally {
				setLoading(false);
			}
		};

		const fetchAllClients = async () => {
			try {
				const response = await fetch("/api/clients");
				if (!response.ok) throw new Error("Failed to fetch clients");

				const data = await response.json();
				// get isDefault client
				const defaultClient = data.find((client: any) => client.isDefault);
				setClient(defaultClient);
			} catch (error) {
				console.error("Error fetching clients:", error);
			} finally {
				setLoading(false);
			}
		};

		if (params.clientSlug) {
			fetchClient();
		} else {
			fetchAllClients();
		}
	}, [params.clientSlug]);

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
				projects={projects}
				setSelectedProject={setSelectedProject}
				selectedProject={selectedProject}
				loading={loading}
			/>
			<ToastContainer />
			<MapComponent
				client={client}
				projects={projects}
				projectsLoading={loading}
				setSelectedProject={setSelectedProject}
				selectedProject={selectedProject}
			/>
		</main>
	);
}
