import { Marker } from "react-map-gl";
import { ProjectsData } from "@/data/ProjectsData";
import { useState } from "react";
import { MarkerConfig } from "@/types/map";

const DefaultIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className="w-4 h-4"
  >
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const ProjectsMarker = ({
  handleClick,
  markerConfig = {}
}: {
  handleClick: (id: string) => void;
  markerConfig?: MarkerConfig;
}) => {
  const [hoveredMarkers, setHoveredMarkers] = useState<{ [key: string]: boolean }>({});

  const {
    iconColor = 'white',
    backgroundColor = 'rgb(59 130 246)', // blue-500
    pulseColor = 'rgba(59, 130, 246, 0.2)', // blue-500/20
    icon = <DefaultIcon />
  } = markerConfig;

  return ProjectsData.features.map((feature) => {
    const data = feature.properties;
    const isHovered = hoveredMarkers[data?.id] || false;
    const isHidden = data?.hiddenAnchor || false;

    if(isHidden) return null;

    return (
      <Marker
        key={`marker-${data?.id}`}
        longitude={data?.lat}
        latitude={data?.lng}
        anchor="center"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          handleClick(data?.id);
        }}
      >
        <div 
          className="relative flex items-center justify-center group"
          onMouseEnter={() => setHoveredMarkers({ ...hoveredMarkers, [data?.id]: true })}
          onMouseLeave={() => setHoveredMarkers({ ...hoveredMarkers, [data?.id]: false })}
        >
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
              {data?.name}
            </div>
          )}
        </div>
      </Marker>
    );
  });
};

export default ProjectsMarker;