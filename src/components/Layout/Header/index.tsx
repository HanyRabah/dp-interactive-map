"use client";

import ProjectList from "@/components/GlobeProjects/ProjectList";
import { Project } from "@/types/project";
import { Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type HeaderProps = {
	projects: Project[];
	selectedProject: Project | null;
	setSelectedProject: (project: Project) => void;
	loading: boolean;
};

const Header = ({ projects, selectedProject, setSelectedProject, loading }: HeaderProps) => {
	const [isProjectListOpen, setIsProjectListOpen] = useState(false);

	const handleProjectSelect = (project: Project) => {
		setIsProjectListOpen(!isProjectListOpen);
		setSelectedProject(project);
	};

	return (
		<div className="fixed top-0 inset-x-0 z-30">
			<header className="relative h-20 px-8 mx-auto duration-200">
				<nav className="txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
					<div className="flex items-center h-full">
						<Link
							href="https://dpproductions.net/"
							target="_blank"
							className="txt-compact-xlarge-plus hover:text-ui-fg-base">
							<div className="absolute top-4 left-8 z-10 shadow-md">
								<Image src="/dp-logo.png" alt="logo" width={40} height={40} priority />
							</div>
						</Link>
					</div>

					<div
						className="flex justify-around w-[100px] text-center items-center p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors z-20 cursor-pointer "
						onClick={() => setIsProjectListOpen(!isProjectListOpen)}>
						{isProjectListOpen ? (
							<Typography variant="body2" className="leading-[1.7] ">
								Close
							</Typography>
						) : (
							<Typography variant="body2" className="leading-[1.7]">
								Projects
							</Typography>
						)}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={`h-6 w-6 transform transition-transform duration-300 ${isProjectListOpen ? "rotate-45" : ""}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							{isProjectListOpen ? (
								<>
									<line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
									<line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
								</>
							) : (
								<>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</>
							)}
						</svg>
					</div>

					<ProjectList
						projects={projects}
						onSelect={handleProjectSelect}
						isOpen={isProjectListOpen}
						loading={loading}
						selected={selectedProject}
					/>
				</nav>
			</header>
		</div>
	);
};

export default Header;
