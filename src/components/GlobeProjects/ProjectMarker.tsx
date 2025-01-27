// components/GlobeProjects/ProjectMarker.tsx
import { Project } from "@/types/project";
import { useState } from "react";
import { Marker } from "react-map-gl";
import MarkerIcon from "../Layout/Icons/Marker";

interface ProjectMarkerProps {
	handleClick: (id: string) => void;
	projects: Project[];
}

const ProjectsMarker = ({ handleClick, projects }: ProjectMarkerProps) => {
	const [hoveredMarkers, setHoveredMarkers] = useState<{ [key: string]: boolean }>({});

	return (
		<>
			{projects.map(project => {
				if (project.hideMarker) return null;

				const isHovered = hoveredMarkers[project.id] || false;
				const {
					iconColor = "white",
					backgroundColor = "rgb(59 130 246)",
					pulseColor = "rgba(59, 130, 246, 0.2)",
					icon = <MarkerIcon />,
				} = project.style || {};

				return (
					<Marker
						key={project.id}
						longitude={project.lng}
						latitude={project.lat}
						onClick={() => handleClick(project.id)}>
						<div
							className="relative flex items-center justify-center group"
							onMouseEnter={() => setHoveredMarkers(prev => ({ ...prev, [project.id]: true }))}
							onMouseLeave={() => setHoveredMarkers(prev => ({ ...prev, [project.id]: false }))}>
							{/* Pulsing Circle */}
							<div
								className="absolute w-16 h-16 rounded-full animate-ping opacity-75"
								style={{ backgroundColor: pulseColor }}
							/>

							{/* Inner Circle */}
							<div
								className="absolute w-8 h-8 rounded-full flex items-center justify-center"
								style={{ backgroundColor }}
							/>

							{/* Icon */}
							<div className="relative z-10 w-4 h-4" style={{ color: iconColor }}>
								{icon}
							</div>

							{/* Tooltip */}
							{isHovered && (
								<div className="absolute whitespace-nowrap px-2 py-1 rounded bg-black/75 text-white text-sm -top-10 left-1/2 -translate-x-1/2">
									{project.name}
								</div>
							)}
						</div>
					</Marker>
				);
			})}
		</>
	);
};

export default ProjectsMarker;
