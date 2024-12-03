
import { MapControlsProps, MapControlsStyleOption } from '@/types/map';
import React, { useEffect, useRef, useState } from 'react';
import { Globe2 } from 'lucide-react'; 
import  { NavigationControl, FullscreenControl,  GeolocateControl } from "react-map-gl";

const SatelliteIcon = () => ( <svg 
  viewBox="0 0 32 32" 
  enableBackground={`new 0 0 32 32`}
  fill="currentColor" 
  className="w-5 h-5"
>
 <path d="m22.9141 16.5 2.7929-2.793a.9994.9994 0 0 0 0-1.414l-2.2929-2.293 2.0859-2.0859 3.0859 3.0859 1.4141-1.4141-7.5859-7.5859-1.4141 1.4141 3.0859 3.0859-2.0859 2.0859-2.293-2.2929a.9994.9994 0 0 0 -1.414 0l-2.793 2.7929-6.793-6.7929a.9994.9994 0 0 0 -1.414 0l-5 5a.9994.9994 0 0 0 0 1.414l6.7929 6.793-2.7929 2.793a.9994.9994 0 0 0 0 1.414l2.2929 2.293-2.0859 2.0859-3.0859-3.0859-1.4141 1.4141 7.5859 7.5859 1.4141-1.4141-3.0859-3.0859 2.0859-2.0859 2.293 2.2929a.9995.9995 0 0 0 1.414 0l2.793-2.7929 6.793 6.7929a.9995.9995 0 0 0 1.414 0l5-5a.9994.9994 0 0 0 0-1.414zm-18.5-8.5 3.5859-3.5859 2.0859 2.0859-3.5859 3.5859zm3.5 3.5 3.5859-3.5859 2.5859 2.5859-3.5859 3.5859zm5.0859 12.0859-4.5859-4.5859 10.5859-10.5859 4.5859 4.5859zm4.9141-2.0859 3.5859-3.5859 2.5859 2.5859-3.5859 3.5859zm6.0859 6.0859-2.0859-2.0859 3.5859-3.5859 2.0859 2.0859z"/><path d="m0 0h32v32h-32z" fill="none"/>
</svg>
);

const StreetIcon = () => ( 
<svg 
  viewBox="0 0 217.205 217.205"
  enableBackground={`new 0 0 32 32`}
  fill="currentColor" 
  className="w-5 h-5">
    <g>
    <path d="M167.631,101.102H49.574c-16.216,0-29.408-13.199-29.408-29.422c0-16.211,13.192-29.399,29.408-29.399h73.789
      c4.143,0,7.5-3.358,7.5-7.5c0-4.142-3.357-7.5-7.5-7.5H49.574c-24.486,0-44.408,19.917-44.408,44.399
      c0,24.494,19.922,44.422,44.408,44.422h118.057c16.216,0,29.408,13.199,29.408,29.423c0,16.211-13.192,29.399-29.408,29.399H93.205
      c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h74.426c24.486,0,44.408-19.917,44.408-44.399
      C212.039,121.03,192.117,101.102,167.631,101.102z"/>
    <path d="M48.516,130.001c-17.407,0-31.568,14.162-31.568,31.568c0,26.865,25.192,52.367,26.265,53.439
      c1.407,1.407,3.314,2.197,5.304,2.197c1.989,0,3.897-0.79,5.304-2.197c1.072-1.073,26.263-26.574,26.263-53.439
      C80.082,144.163,65.922,130.001,48.516,130.001z M48.516,198.357c-6.477-7.995-16.568-22.713-16.568-36.788
      c0-9.136,7.433-16.568,16.568-16.568c9.135,0,16.566,7.433,16.566,16.568C65.082,175.644,54.991,190.362,48.516,198.357z"/>
    <path d="M168.053,87.202c1.919,0,3.838-0.732,5.302-2.195c1.073-1.072,26.278-26.573,26.278-53.44
      C199.633,14.161,185.466,0,168.053,0c-17.407,0-31.568,14.161-31.568,31.566c0,26.866,25.192,52.367,26.266,53.439
      C164.214,86.47,166.133,87.202,168.053,87.202z M168.053,15c9.143,0,16.58,7.432,16.58,16.566c0,14.076-10.1,28.796-16.579,36.79
      c-6.476-7.994-16.569-22.713-16.569-36.79C151.484,22.432,158.917,15,168.053,15z"/>
  </g>
</svg>
);

// const CitySelector = ({mapRef}: {
//   mapRef: React.RefObject<MapRef>;
// }) => {
//   const cities = [
//     { name: 'Cairo', coordinates: [31.2357, 30.0444] as [number, number], zoom: 10 },
//     { name: 'New Cairo', coordinates: [31.4721, 30.0075] as [number, number], zoom: 12 },
//     // Add more cities
//   ];

//   return (
//     <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10">
//       <select 
//         onChange={(e) => {
//           const city = cities[parseInt(e.target.value)];
//           mapRef.current?.flyTo({
//             center: city.coordinates,
//             zoom: city.zoom,
//             duration: 2000
//           });
//         }}
//         className="px-2 py-1 rounded border"
//       >
//         <option value="">Select City</option>
//         {cities.map((city, index) => (
//           <option key={city.name} value={index}>
//             {city.name}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

const MapControls: React.FC<MapControlsProps> = ({ showGoogleLayer, toggleGoogleLayer, handleZoomOut, isZoomedOut, showMarkers, showPolygons, setShowMarkers, setShowPolygons }) => {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedMapStyle, setSelectedMapStyle] = useState<string>('satellite');
  const menuRef = useRef<HTMLDivElement>(null);
  const mapStyles: MapControlsStyleOption[] = [
    {
      id: 'streets',
      name: 'Streets',
      value: 'mapbox://styles/mapbox/streets-v12',
      icon: <StreetIcon />,
      action: toggleGoogleLayer
    },
    {
      id: 'satellite',
      name: 'Satellite',
      value: 'mapbox://styles/mapbox/satellite-v9', // reset to normal
      icon: <SatelliteIcon />,
      action: toggleGoogleLayer
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStyleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStyleChange = (style: MapControlsStyleOption) => {
    //if (!!style.action) {
      toggleGoogleLayer();
      setSelectedMapStyle(style.id);
    // } else if (style.value) {
    //   const map = mapBox?.current?.getMap();
    //   map?.setStyle(style.value);
    // }
    setShowStyleMenu(false);
  };

  
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
         {/* Globe View Button */}
      <button
        onClick={handleZoomOut}
        disabled={isZoomedOut}
        className={`
          w-10 h-10 
          flex items-center justify-center
          rounded-lg bg-white shadow-md
          hover:bg-gray-50 
          transition-all duration-200
          border border-gray-200
          ${!showGoogleLayer ? 'text-blue-500' : 'text-gray-500'}
          ${isZoomedOut ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${isZoomedOut ? 'opacity-50' : 'opacity-100'}
        `}
        title="Globe View"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="w-5 h-5"
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </button>
      {/* Map Style Button */}
      <button
        onClick={() => setShowStyleMenu(!showStyleMenu)}
        className={`
          w-10 h-10 
          flex items-center justify-center
          rounded-lg bg-white shadow-md
          hover:bg-gray-50 
          transition-all duration-200
          border border-gray-200
          'text-blue-500' : 'text-gray-500'
          'cursor-pointer opacity-100'
        `}
        title="Map Styles"
      >
        <Globe2 className="w-5 h-5" />
      </button>
      {showStyleMenu && (
        <div className="absolute right-12 top-12 bg-white rounded-lg shadow-lg py-2 min-w-[120px] shadow-lg">
          {mapStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style)}
              className={`
                w-full
                px-4 py-2 
                flex items-center 
                gap-2 
                hover:bg-blue-400 
                hover:text-white
                transition-colors
                ${selectedMapStyle === style.id ? 'text-white' : 'text-gray-500'}
                ${selectedMapStyle === style.id ? 'bg-blue-400' : ''}
              `}
              disabled={selectedMapStyle === style.id}
            >
              {style.icon}
              <span className="text-sm">{style.name}</span>
            </button>
          ))}
        </div>
      )}
  
      {/* <button
        onClick={handleZoomOut}
        className={`
          w-10 h-10 
          flex items-center justify-center
          rounded-lg bg-white shadow-md
          hover:bg-gray-50 
          transition-all duration-200
          border border-gray-200
          text-gray-500
        `}
        title="Reset View"
      >
        <MapPin className="w-5 h-5" />
      </button> */}

        <button
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          className={`
            w-10 h-10 
            flex items-center justify-center
            rounded-lg bg-white shadow-md
            hover:bg-gray-50 
            transition-all duration-200
            border border-gray-200
            text-gray-500
          `}
          title="Settings"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="w-5 h-5"
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>

        {showSettingsMenu && (
        <div className="absolute right-12 top-24 bg-white rounded-lg shadow-lg py-2 min-w-[130px] shadow-lg">
            <>
              <div className="bg-white p-2 rounded shadow">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showMarkers}
                    onChange={(e) => setShowMarkers(e.target.checked)}
                  />
                  <span>Show Markers</span>
                </label>
              </div>

              <div className="bg-white p-2 rounded shadow">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showPolygons}
                    onChange={(e) => setShowPolygons(e.target.checked)}
                  />
                  <span>Show Polygons</span>
                </label>
              </div>
            </>
        </div>
      )}

            <NavigationControl position="bottom-right" showCompass={false} style={{ padding: 6 }}/>
            <FullscreenControl position="bottom-right" style={{ padding: 6 }}/>
            <GeolocateControl position="bottom-right" style={{ padding: 6 }}/>
            {/* <ScaleControl position="bottom-right" /> */}
            
            {/* Custom City Selector */}
            {/* {mapBox && <CitySelector mapRef={mapBox} /> } */}
      </div>
    );
  };
  export default MapControls;