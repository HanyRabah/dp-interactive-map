'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import Header from '@/components/Layout/Header';
import Loader from '@/components/Loader';

const MapComponent = dynamic(() => import('@/components/Map/MapContainer'), {
  ssr: false,
});


export default function Home() {
  const [mapboxLoaded, setMapboxLoaded] = useState(false);

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

  return (
    <main className="w-full h-screen relative">
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        onLoad={() => setMapboxLoaded(true)}
        strategy="beforeInteractive"
      />
        <Loader showLoader={!mapboxLoaded} />
        <Header />
        <MapComponent />
    </main>
  );
}