import _ from "lodash";
import { useEffect, useState } from "react";
import { Marker } from "react-map-gl";
import MarkerIcon from "../Layout/Icons/Marker";

interface ProjectGroup {
	projects: any[];
	center: {
		lat: number;
		lng: number;
	};
}

interface ClusteredMarkersProps {
	projects: any[];
	zoom: number;
	handleClick: (id: string) => void;
	onGroupClick: (center: [number, number]) => void;
}

const ClusteredMarkers = ({ projects, zoom, handleClick, onGroupClick }: ClusteredMarkersProps) => {
	const [hoveredMarkers, setHoveredMarkers] = useState<{ [key: string]: boolean }>({});
	const [groupedProjects, setGroupedProjects] = useState<ProjectGroup[]>([]);

	// Group projects based on proximity
	useEffect(() => {
		const DISTANCE_THRESHOLD = 0.1; // Roughly 11km at the equator

		const groups: ProjectGroup[] = [];
		const assignedProjects = new Set();

		projects.forEach(project => {
			if (assignedProjects.has(project.id)) return;

			const group: ProjectGroup = {
				projects: [project],
				center: {
					lat: project.lat,
					lng: project.lng,
				},
			};

			// Find nearby projects
			projects.forEach(otherProject => {
				if (project.id === otherProject.id || assignedProjects.has(otherProject.id)) return;

				const distance = Math.sqrt(
					Math.pow(project.lat - otherProject.lat, 2) + Math.pow(project.lng - otherProject.lng, 2)
				);

				if (distance < DISTANCE_THRESHOLD) {
					group.projects.push(otherProject);
					assignedProjects.add(otherProject.id);
				}
			});

			// Calculate group center
			if (group.projects.length > 1) {
				group.center = {
					lat: _.meanBy(group.projects, "lat"),
					lng: _.meanBy(group.projects, "lng"),
				};
			}

			groups.push(group);
			assignedProjects.add(project.id);
		});

		setGroupedProjects(groups);
	}, [projects]);

	// Render grouped markers when zoomed out
	if (zoom < 8) {
		return (
			<>
				{groupedProjects.map((group, index) => {
					const isMultipleProjects = group.projects.length > 1;

					return (
						<Marker
							key={`group-${index}`}
							longitude={group.center.lng}
							latitude={group.center.lat}
							onClick={() => onGroupClick([group.center.lng, group.center.lat])}>
							<div
								className="relative flex items-center justify-center group"
								onMouseEnter={() => setHoveredMarkers(prev => ({ ...prev, [`group-${index}`]: true }))}
								onMouseLeave={() => setHoveredMarkers(prev => ({ ...prev, [`group-${index}`]: false }))}>
								{isMultipleProjects ? (
									// Cluster marker style
									<>
										<div
											className="absolute w-20 h-20 rounded-full animate-ping opacity-75"
											style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
										/>
										<div
											className="absolute w-10 h-10 rounded-full flex items-center justify-center"
											style={{ backgroundColor: "rgb(59 130 246)" }}>
											<span className="text-white text-xs font-bold">{group.projects.length}</span>
										</div>
									</>
								) : (
									// Single project marker style
									<>
										<div
											className="absolute w-16 h-16 rounded-full animate-ping opacity-75"
											style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
										/>
										<div
											className="absolute w-8 h-8 rounded-full flex items-center justify-center"
											style={{ backgroundColor: "rgb(59 130 246)" }}
										/>
										<div className="relative z-10 w-4 h-4 text-white">
											<MarkerIcon />
										</div>
									</>
								)}

								{hoveredMarkers[`group-${index}`] && (
									<div className="absolute whitespace-nowrap px-2 py-1 rounded bg-black/75 text-white text-sm -top-10 left-1/2 -translate-x-1/2">
										{isMultipleProjects ? `${group.projects.length} projects in this area` : group.projects[0].name}
									</div>
								)}
							</div>
						</Marker>
					);
				})}
			</>
		);
	}

	// Render individual project markers when zoomed in
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
							<div
								className="absolute w-16 h-16 rounded-full animate-ping opacity-75"
								style={{ backgroundColor: pulseColor }}
							/>
							<div
								className="absolute w-8 h-8 rounded-full flex items-center justify-center"
								style={{ backgroundColor }}
							/>
							<div className="relative z-10 w-4 h-4" style={{ color: iconColor }}>
								{icon}
							</div>

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

export default ClusteredMarkers;
