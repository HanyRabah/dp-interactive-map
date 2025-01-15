import React, { useMemo, useState } from 'react';
import { GlobePOIMarkers } from './GlobePOIMarkers';
import { POIMarkers, POIColors, POILabels } from './markers';
import { POI } from '@/types/poi';
 
interface POIFilterPanelProps {
  pois: POI[];
  onPOIClick: (poi: POI) => void;
}

const POIFilterPanel: React.FC<POIFilterPanelProps> = ({ pois, onPOIClick }) => {
  const [showFilter, setShowFilter] = useState(false);

  const poiTypes = useMemo(() => {
    return Array.from(new Set(pois.map((poi) => poi.type.name)));
  }, [pois]);
  
  const [activeFilters, setActiveFilters] = useState(    
    Object.fromEntries(poiTypes.map(type => [type, true]))
  );

  const toggleFilter = (type: keyof typeof POILabels) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const filteredPois = pois.filter((poi) => activeFilters[poi.type.name]);

  return (
    <>
      <div className="fixed top-24 left-4 z-10 w-[180px]">
        <div className="bg-black/60 rounded-lg shadow-lg">
          <div
            className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors  ${
              showFilter ? 'rounded-t-lg' : 'rounded-lg'
            }`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <span className="text-sm font-medium text-white">Map Filters</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${showFilter ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="white"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {showFilter && (
            <div className="bg-black/40 rounded-b-lg shadow-lg p-2 ">
              {Object.entries(activeFilters).map(([type]) => {
                
                const Icon = POIMarkers[type as keyof typeof POIMarkers];
                const color = POIColors[type as keyof typeof POIColors];
                const Label = POILabels[type as keyof typeof POILabels];

              return (
                <div key={type} 
                className={`group flex p-1 mb-1 rounded-lg items-center space-x-2 cursor-pointer hover:bg-white ${activeFilters[type as keyof typeof POILabels] && 'bg-gray-800'}`} 
                onClick={() => toggleFilter(type as keyof typeof POILabels)}>
                    {/* activeFilters[type as keyof typeof POILabels] */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={() => toggleFilter(type as keyof typeof POILabels)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white  group-hover:text-black">{Label}</h4>
                    </div>
                  </div>
              )
                    })}
                  </div>
          )}
        </div>
      </div>
      <GlobePOIMarkers pois={filteredPois} onPOIClick={onPOIClick} showMarkers={true} />
    </>
  );
};

export default POIFilterPanel;

