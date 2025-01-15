// components/GlobeProjects/ProjectPolygons.tsx
import { Layer, MapMouseEvent, Source, useMap } from "react-map-gl";
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_CONFIG, POLYGON_STYLES } from "@/styles/mapStyles";
import ProjectDetailsModal from "./ProjectDetailsModal";
import { coordinateUtils } from "@/utils/coordinates";
import { HoveredFeature, Project } from "@/types/project";
import { geoUtils } from '@/utils/geoUtils';
import { POI as POIType, RouteInfo } from '@/types/poi';
import { routeUtils } from '@/utils/routeUtils';
import POIFilterPanel from "../POI/POIFilterPanel";
import RouteLineAnimation from "./RouteLineAnimation";



const ProjectPolygons = ({ project, sendSelectedPOI, sendRouteInfo }: {project: Project, sendSelectedPOI: (poi: POIType | null) => void, sendRouteInfo: (routeInfo: RouteInfo | null) => void}) => {
  const { current: mapInstance } = useMap();
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredFeature | null>(null);
  const sourcesRef = useRef<Set<string>>(new Set());
  const animationFramesRef = useRef<{ [key: string]: number }>({});
  const [nearbyPois, setNearbyPois] = useState<POIType[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POIType | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const fetchPOIsInBounds = useCallback(async (project: Project) => {
    if (!project.polygon) return;

    try {
      const coordinates = JSON.parse(project.polygon.coordinates);
      const bounds = geoUtils.getPolygonBounds(coordinates);
      
      const response = await fetch(
        `/api/pois/nearby?` +
        `latMin=${bounds.latMin}&` +
        `latMax=${bounds.latMax}&` +
        `lonMin=${bounds.lonMin}&` +
        `lonMax=${bounds.lonMax}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch POIs');
      
      const data = await response.json();
       setNearbyPois(data);
    } catch (error) {
      console.error('Error fetching POIs:', error);
      setNearbyPois([]);
    }
  }, []);

   // Replace hover effect with useCallback
   const handleHover = useCallback((e: MapMouseEvent) => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
    
    const features = map.queryRenderedFeatures(e.point);
    const polygonFeature = features.find(f => f.source && f.layer?.id?.endsWith('-layer'));
    
    if (polygonFeature) {
      if (polygonFeature.properties) {
        if (project) {
          setHoveredTooltip({
            name: project.name,
            x: e.point.x,
            y: e.point.y,
            properties: {
              name: project.polygon?.name || '',
              description: project.polygon?.description || '',
              style: project.polygon?.style
            }
          });
        }
      }
    } else {
      setHoveredTooltip(null);
    }
  }, [mapInstance, project]);


  const handleClick = useCallback((e: MapMouseEvent) => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
    
    const features = map.queryRenderedFeatures(e.point);
    const polygonFeature = features.find(f => f.source && f.layer?.id?.endsWith('-layer'));
    
    if (polygonFeature) {
      if (project) {
         setShowProjectDetails(true);
        //onProjectClick(project);
      }
    }
  }
  , [mapInstance, project]);

  // Cleanup line layer helper
  const cleanupLine = useCallback((map: mapboxgl.Map, id: string) => {
    try {
      if (animationFramesRef.current[id]) {
        cancelAnimationFrame(animationFramesRef.current[id]);
        delete animationFramesRef.current[id];
      }

      const layers = [`${id}-line-dashed`, `${id}-line-background`];
      layers.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      if (map.getSource(id)) {
        map.removeSource(id);
      }

      sourcesRef.current.delete(id);
    } catch (error) {
      console.error(`Error cleaning up line ${id}:`, error);
    }
  }, []);

  // Main cleanup helper
  const cleanupLayersAndSources = useCallback(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();

    // Cleanup existing line layers
    Array.from(sourcesRef.current).forEach(id => {
      cleanupLine(map, id);
    });

    // Cleanup polygon layers
      const id = project.polygon?.id;
      if (!id) return;
      const layerId = `${id}-layer`;
      try {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(id)) {
          map.removeSource(id);
        }
      } catch (error) {
        console.error(`Error cleaning up polygon ${id}:`, error);
      }

    sourcesRef.current.clear();
  }, [mapInstance, cleanupLine, project]);

  // const fetchNearbyPOIs = useCallback(async (project: Project) => {
  //   if (!project.polygon) return;

  //   try {
  //     const coordinates = JSON.parse(project.polygon.coordinates);
  //     const center = geoUtils.getPolygonCenter(coordinates);
      
  //     const response = await fetch(
  //       `/api/pois/nearby?lat=${center.lat}&lng=${center.lng}&radius=20`
  //     );
      
  //     if (!response.ok) throw new Error('Failed to fetch nearby POIs');
      
  //     const data = await response.json();
  //     setNearbyPois(data);
  //   } catch (error) {
  //     console.error('Error fetching nearby POIs:', error);
  //     setNearbyPois([]);
  //   }
  // }, []);


  const handlePOIClick = useCallback((poi: POIType) => {
    if (!project?.polygon) return;
    setSelectedPOI(poi);
    sendSelectedPOI(poi);
    const map = mapInstance?.getMap();

    // Get polygon center
    const coordinates = JSON.parse(project.polygon.coordinates);
    const center = geoUtils.getPolygonCenter(coordinates);
    
    // Fetch both driving and walking routes
    Promise.all([
      routeUtils.fetchRouteMapBox([center.lng, center.lat], [poi.lng, poi.lat], 'driving'),
      routeUtils.fetchRouteMapBox([center.lng, center.lat], [poi.lng, poi.lat], 'walking'),
    ])
    .then(([drivingRoute, walkingRoute]) => {
      if (drivingRoute && !('message' in drivingRoute)) {
        const routeInfo: RouteInfo = {
          driving: drivingRoute,
          walking: walkingRoute && !('message' in walkingRoute) ? walkingRoute : null,
          activeMode: 'driving',
        };
  
        setRouteInfo(routeInfo);
        sendRouteInfo(routeInfo);
  
        // Fit map to show the entire route
        if (map && drivingRoute.geometry) {
          const bounds = map.getBounds();
          if (!bounds) return;
  
          drivingRoute.geometry.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
          map.fitBounds(bounds, { padding: 50 });
        }
      }
    })
    .catch((error) => {
      console.error('Error fetching routes:', error);
      setRouteInfo(null);
      sendRouteInfo(null);
    });
  }, [project, mapInstance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(animationFramesRef.current).forEach(frame => {
        cancelAnimationFrame(frame);
      });
      animationFramesRef.current = {};
      cleanupLayersAndSources();
    };
  }, [cleanupLayersAndSources]);

  // Add line layers
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();

    cleanupLayersAndSources();

    
      const { polygon } = project;
      if(!polygon) return;
      if (polygon.type !== "LineString") return;

      try {
        const coordinates = polygon.coordinates
        if (!coordinates) return;

        map.addSource(polygon.id, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {
              id: polygon.id,
              name: polygon.name,
              style: polygon.style || project.style
            },
            geometry: {
              type: "LineString",
              coordinates: coordinateUtils.parse(polygon.coordinates)
            }
          }
        });

        sourcesRef.current.add(polygon.id);

        // Background line
        map.addLayer({
          id: `${polygon.id}-line-background`,
          type: "line",
          source: polygon.id,
          paint: {
            'line-color': polygon.style?.lineColor || POLYGON_STYLES.default.color,
            'line-width': polygon.style?.lineWidth || POLYGON_STYLES.default.width,
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8,
              polygon.style?.lineOpacity || POLYGON_STYLES.hover.opacity
            ]
          }
        });

        // Animated dashed line if lineDashArray is specified
        const lineDashArray = polygon.style?.lineDashArray ? [JSON.parse(polygon.style.lineDashArray as string)] : [2, 2];
        if (lineDashArray) {
          map.addLayer({
            id: `${polygon.id}-line-dashed`,
            type: "line",
            source: polygon.id,
            paint: {
              'line-color': polygon.style?.lineColor || POLYGON_STYLES.default.color,
              'line-width': polygon.style?.lineWidth || POLYGON_STYLES.default.width,
              'line-dasharray': lineDashArray
            }
          });

          let step = 0;
          const animate = (timestamp: number) => {
            if (!map.getLayer(`${polygon.id}-line-dashed`)) {
              if (animationFramesRef.current[polygon.id]) {
                cancelAnimationFrame(animationFramesRef.current[polygon.id]);
                delete animationFramesRef.current[polygon.id];
              }
              return;
            }

            const newStep = parseInt((timestamp / 50) % ANIMATION_CONFIG.DASH_ARRAY_SEQUENCE.length as any);
            
            if (newStep !== step) {
              try {
                map.setPaintProperty(
                  `${polygon.id}-line-dashed`,
                  'line-dasharray',
                  ANIMATION_CONFIG.DASH_ARRAY_SEQUENCE[newStep]
                );
                step = newStep;
              } catch (error) {
                console.error(`Error updating dash array for ${polygon.id}:`, error);
                return;
              }
            }

            animationFramesRef.current[polygon.id] = requestAnimationFrame(animate);
          };

          animationFramesRef.current[polygon.id] = requestAnimationFrame(animate);
        }
      } catch (error) {
        console.error(`Error adding line layers for ${polygon.id}:`, error);
      }
    

    return () => {
      cleanupLayersAndSources();
    };
  }, [mapInstance, cleanupLayersAndSources, project]);

  useEffect(() => {
    if (project) {
      fetchPOIsInBounds(project);
    } else {
      setNearbyPois([]);
      setSelectedPOI(null);
      sendSelectedPOI(null);
    }
  }, [project, fetchPOIsInBounds, sendSelectedPOI]);

  // Add hover and click event listeners to polygons
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();

    map.on('mousemove', handleHover);
    map.on('click', handleClick);
    
    return () => {
      map.off('mousemove', handleHover);
      map.off('click', handleClick);
    };
  }, [mapInstance, handleHover, handleClick]);
  
 
  return (
    <>
        <Source 
            key={project.polygon?.id}
            id={project.polygon?.id}
            type="geojson" 
            data={{
              type: "Feature",
              properties: {
                id: project.polygon?.id,
                name: project.polygon?.name,
                style: project.polygon?.style,
                projectId: project.id
              },
              geometry: {
                type: project.polygon?.type,
                coordinates: [JSON.parse(project.polygon?.coordinates?.toString() || '[]')] 
              }
            }}
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              //onProjectClick(project)
            }}
          >
            <Layer 
              id={`${project.polygon?.id}-layer`}
              type="fill"
              paint={{
                'fill-color': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  project.polygon?.style?.hoverFillColor || '#ff0000', // Hover color
                  project.polygon?.style?.fillColor || '#00ff00' // Default color
                ],
                'fill-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  project.polygon?.style?.hoverFillOpacity || 0.8, // Hover opacity
                  project.polygon?.style?.fillOpacity || 0.5 // Default opacity
                ],
                'fill-outline-color': project.polygon?.style?.fillColor || '#00ff00',
              }}
            />
        </Source>
      
      {hoveredTooltip && (
        <motion.div 
          className="absolute z-20 pointer-events-none"
          style={{ 
            left: hoveredTooltip.x, 
            top: hoveredTooltip.y - 10
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg">
            <p className="text-sm font-medium">{hoveredTooltip.properties.name}</p>
            {hoveredTooltip.properties?.description && (
              <p className="text-xs text-gray-600 mt-1">
                {hoveredTooltip.properties.description}
              </p>
            )}
          </div>
        </motion.div>
      )}
      
      {showProjectDetails && (
        <ProjectDetailsModal 
          isOpen={true}
          onClose={() => setShowProjectDetails(false)}
          project={project}
        />
      )} 

      {routeInfo && routeInfo[routeInfo.activeMode] && (
        <Source
          id="route"
          type="geojson"
          data={{
            type: 'Feature',
            properties: {},
            geometry: routeInfo[routeInfo.activeMode]!.geometry
          }}
        >
          {/* <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': routeInfo.activeMode === 'driving' ? '#4299e1' : '#48bb78',
              'line-width': 3,
              'line-opacity': 0.8
            }}
          /> */}
          <RouteLineAnimation routeInfo={routeInfo} />
        </Source>
      )}
      {nearbyPois.length && <POIFilterPanel pois={nearbyPois} onPOIClick={handlePOIClick} />}
      {/* <POIPanel
        pois={nearbyPois}
        selectedPOI={selectedPOI}
        onPOIClick={handlePOIClick}
        routeInfo={routeInfo}
        projectCenter={project ? geoUtils.getPolygonCenter(
          JSON.parse(project.polygon!.coordinates)
        ) : null}
      /> */}
    </>
  );
};

export default ProjectPolygons;