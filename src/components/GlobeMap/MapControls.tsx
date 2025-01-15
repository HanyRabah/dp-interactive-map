// components/GlobeMap/MapControls.tsx
import { MapControlsProps, MapControlsStyleOption } from '@/types/map';
import React, { useEffect, useRef, useState } from 'react';
import { SatelliteIcon, Waypoints, GlobeIcon, Globe2Icon } from 'lucide-react'; 
import  { NavigationControl, FullscreenControl } from "react-map-gl";
import { Box } from '@mui/material';


const ControlButton: React.FC<{ onClick: () => void; title: string; icon: React.ReactNode; disabled?: boolean }> = ({ onClick, title, icon, disabled }) => (
  <Box
    title={title}
    onClick={onClick}
    sx={{ width: 41, height: 41 }}
    className={`
      flex items-center justify-center
      rounded-lg bg-white shadow-md
      hover:bg-gray-50 
      transition-all duration-200
      box-shadow-lg
      border border-gray-500
      border-opacity-20
      border-outside
      ${disabled ? 'text-blue-500' : 'text-gray-500'}
      ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      ${disabled ? 'opacity-50' : 'opacity-100'}
    `}
  >
    {icon}
  </Box>
);

const ControlSubMenu: React.FC<{ onClick: ()=> void, selected: boolean, children: React.ReactNode }> = ({onClick, selected, children }) => (
  <Box
    onClick={selected ? undefined : onClick}
    className={`
      w-full
      px-4 py-2 
      flex items-center 
      gap-2 
      hover:bg-blue-400 
      hover:text-white
      transition-colors
      ${selected ? 'text-white' : 'text-gray-500'}
      ${selected ? 'bg-blue-400' : ''}
      cursor-pointer: ${selected ? 'cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </Box>
);

const MapControls: React.FC<MapControlsProps> = ({  toggleGoogleLayer, handleZoomOut, isZoomedOut}) => {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  //const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedMapStyle, setSelectedMapStyle] = useState<string>('satellite');
  const menuRef = useRef<HTMLDivElement>(null);
  const mapStyles: MapControlsStyleOption[] = [
    {
      id: 'streets',
      name: 'Streets',
      value: 'mapbox://styles/mapbox/streets-v12',
      icon: <Waypoints width={18} />,
      action: toggleGoogleLayer
    },
    {
      id: 'satellite',
      name: 'Satellite',
      value: 'mapbox://styles/mapbox/satellite-v9', // reset to normal
      icon: <SatelliteIcon width={18} />,
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
      toggleGoogleLayer();
      setSelectedMapStyle(style.id);
    setShowStyleMenu(false);
  };

  
  return (
    <div className="absolute right-2.5 bottom-40  flex flex-col gap-2 z-10">
         {/* Globe View Button */}
      <ControlButton onClick={handleZoomOut} disabled={isZoomedOut} icon={<GlobeIcon width={18}/>} title="Globe View" />
      {/* Map Style Button */}
      <ControlButton onClick={() => setShowStyleMenu(!showStyleMenu)} icon={<Globe2Icon width={18}/>} title="Map Styles" />
      {showStyleMenu && (
        <div className="absolute right-12 top-12 bg-white rounded-lg shadow-lg py-2 min-w-[120px] shadow-lg">
          {mapStyles.map((style) => (
            <ControlSubMenu 
            onClick={() => handleStyleChange(style)} 
            key={style.id} 
            selected={selectedMapStyle === style.id}>
              {style.icon}
              <span>{style.name}</span>
            </ControlSubMenu>
          ))}
        </div>
      )}
       {/* <ControlButton onClick={() => setShowSettingsMenu(!showSettingsMenu)} icon={<Settings width={18}/>} title="Settings" />

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
      )} */}

      <NavigationControl position="bottom-right" showCompass={false} style={{ padding: 6 }}/>
      <FullscreenControl position="bottom-right" style={{ padding: 6 }}/>
      {/* <GeolocateControl position="bottom-right" style={{ padding: 6 }}/> */}
      </div>
    );
  };
  export default MapControls;