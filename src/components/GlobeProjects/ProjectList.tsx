"use client";
import { Project } from "@/types/project";
import React from "react";

interface ProjectListProps {
	projects: Project[];
	onSelect: (project: Project) => void;
	isOpen: boolean;
	loading: boolean;
	selected: Project | null;
}

const ProjectListSkeleton = () => (
	<div className="fixed top-20 right-0 h-screen w-[400px] bg-black shadow-lg">
		<div className="overflow-y-auto h-[calc(100%-64px)]">
			{[...Array(5)].map((_, i) => (
				<div key={i} className="px-3 py-3 flex items-start space-x-4">
					<div className="w-44 h-32 bg-gray-700 rounded-md animate-pulse" />
					<div className="flex-1 space-y-2">
						<div className="h-6 bg-gray-700 rounded animate-pulse w-3/4" />
						<div className="space-y-1">
							<div className="h-3 bg-gray-700 rounded animate-pulse" />
							<div className="h-3 bg-gray-700 rounded animate-pulse w-5/6" />
							<div className="h-3 bg-gray-700 rounded animate-pulse w-4/6" />
						</div>
					</div>
				</div>
			))}
		</div>
	</div>
);

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelect, isOpen, loading, selected }) => {
	if (loading) return <ProjectListSkeleton />;
	return (
		<div
			className={`fixed top-20 right-0 h-screen w-[400px] bg-black/80 backdrop-blur-lg shadow-lg shadow-white/30 transition-transform duration-300  ${
				isOpen ? "translate-x-0" : "translate-x-full"
			}`}>
			<div className=" overflow-y-auto h-[calc(100%-64px)] group/item">
				{projects.map(project => {
					return (
						<button
							key={project.id}
							onClick={() => {
								onSelect(project);
							}}
							className={`group/edit w-full text-left shadow-md px-3 py-3 hover:bg-white transition-colors  flex items-start space-x-4 mb-1 ${
								selected?.id === project.id ? "bg-white" : ""
							}`}>
							{/* Placeholder for project image */}
							<div className="w-44 h-32 bg-gray-200 rounded-md flex items-center justify-center">
								{project?.polygon?.popupDetails?.image ? (
									<img
										src={project.polygon.popupDetails.image}
										alt={project.name}
										className="w-full h-full object-cover rounded-md"
									/>
								) : (
									<span className="text-xs text-gray-500">No Image</span>
								)}
							</div>

							<div className="flex-1 ">
								<h2
									className={`text-lg font-medium mb-1 text-white group-hover/edit:text-black transition-colors ${
										selected?.id === project.id ? "text-black" : ""
									}`}>
									{project.name}
								</h2>
								{project.description && (
									<p
										className={`text-xs line-clamp-3 text-white group-hover/edit:text-gray-600 transition-colors ${
											selected?.id === project.id ? "text-black" : ""
										}`}>
										{project.description}
									</p>
								)}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default ProjectList;
