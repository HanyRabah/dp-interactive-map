'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Header from '@/components/Layout/Header';
import Loader from '@/components/Loader';
import { ToastContainer } from 'react-toastify';
import { Project } from '@/types/project';
import { useMapData } from '@/hooks/useMapData';


const MapComponent = dynamic(() => import('@/components/GlobeMap'), {
  ssr: false,
});


export default function Home() {
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { mapData: Projects, error } = useMapData();
  

  useEffect(() => {
    // Add Mapbox CSS
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
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
        <Loader showLoader={!mapboxLoaded} />
        <Header 
          projects={Projects} 
          setSelectedProject={setSelectedProject}
          selectedProject={selectedProject}
          />
        <ToastContainer />
        <MapComponent 
        projects={Projects} 
        setSelectedProject={setSelectedProject} 
        selectedProject={selectedProject} />
    </main>
  );
}