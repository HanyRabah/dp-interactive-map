"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProjectList from "@/components/GlobeProjects/ProjectList";
 import { Project } from "@/types/project";

 type HeaderProps = { 
  projects: Project[], 
  selectedProject: Project | null,
  setSelectedProject: (project: Project) => void
}

const Header = ({ projects, selectedProject, setSelectedProject }:HeaderProps) => {
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);
 
  const handleProjectSelect = (project: Project) => {
    setIsProjectListOpen(!isProjectListOpen);
    setSelectedProject(project);
  }
  
  return (
    <div className="fixed top-0 inset-x-0 z-30 bg-black/60 backdrop-blur-sm"> 
      <header className="relative h-20 px-8 mx-auto duration-200">
        <nav className="txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex items-center h-full">
            <Link
              href="https://dpproductions.net/"
              target="_blank"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base"
            >
              <div className="absolute top-4 left-8 z-10 shadow-md">
                <Image 
                  src="/dp-logo.png" 
                  alt="logo" 
                  width={40} 
                  height={40} 
                  priority
                />
              </div>
            </Link>
          </div>

          <button
            onClick={() => setIsProjectListOpen(!isProjectListOpen)}
            className="p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          {isProjectListOpen &&
            <ProjectList
              projects={projects}
              onSelect={handleProjectSelect}
              isOpen={isProjectListOpen}
            />  
          }
        </nav>
      </header>
    </div>
  );
};

export default Header;