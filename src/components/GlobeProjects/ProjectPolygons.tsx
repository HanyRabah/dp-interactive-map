import { Layer, MapMouseEvent, Source, useMap } from "react-map-gl";
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_CONFIG, POLYGON_STYLES } from "@/styles/mapStyles";
import ProjectDetailsModal from "./ProjectDetailsModal";

// Types
interface Project {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  polygons: Array<{
    id: string;
    name: string;
    type: string;
    minZoom?: number;
    maxZoom?: number;
    coordinates: string;
    style?: {
      fillColor?: string;
      hoverFillColor?: string;
      fillOpacity?: number;
      hoverFillOpacity?: number;
      lineColor?: string;
      lineWidth?: number;
      lineOpacity?: number;
      lineDashArray?: string;
    };
  }>;
  style?: {
    fillColor?: string;
    hoverFillColor?: string;
    fillOpacity?: number;
    hoverFillOpacity?: number;
    lineColor?: string;
    lineWidth?: number;
    lineOpacity?: number;
    lineDashArray?: string;
  };
}
interface ProjectPolygonsProps {
  projects: Project[];
}
interface HoveredFeature {
  name: string;
  x: number;
  y: number;
  properties: {
    name: string;
    description?: string;
    [key: string]: any;
  };
}

const ProjectPolygons = ({ projects }: ProjectPolygonsProps) => {
  const { current: mapInstance } = useMap();
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredFeature | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const sourcesRef = useRef<Set<string>>(new Set());
  const animationFramesRef = useRef<{ [key: string]: number }>({});

   // Replace hover effect with useCallback
   const handleHover = useCallback((e: MapMouseEvent) => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
    
    const features = map.queryRenderedFeatures(e.point);
    const polygonFeature = features.find(f => f.source && f.layer.id?.endsWith('-layer'));
    
    if (polygonFeature) {
      setHoveredFeatureId(polygonFeature.properties?.id || null);
      if (polygonFeature.properties) {
        const project = projects.find(p => p.id === polygonFeature.properties?.projectId);
        if (project) {
          setHoveredTooltip({
            name: project.name,
            x: e.point.x,
            y: e.point.y,
            properties: {
              name: project.polygons.find(p => p.id === polygonFeature.properties?.id)?.name || '',
              description: project.polygons.find(p => p.id === polygonFeature.properties?.id)?.description || ''
            }
          });
        }
      }
    } else {
      setHoveredFeatureId(null);
      setHoveredTooltip(null);
    }
  }, [mapInstance, projects]);

  const handleClick = useCallback((e: MapMouseEvent) => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
    
    const features = map.queryRenderedFeatures(e.point);
    const polygonFeature = features.find(f => f.source && f.layer.id?.endsWith('-layer'));
    
    if (polygonFeature) {
      const project = projects.find(p => p.id === polygonFeature.properties?.projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }
  , [mapInstance, projects]);
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();

    map.on('mousemove', handleHover);
    map.on('click', handleClick);
    
    return () => {
      map.off('mousemove', handleHover);
      map.off('click', handleClick);
    };
  }, [mapInstance, handleHover]);

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
    projects.forEach(project => {
      project.polygons.forEach(polygon => {
        const layerId = `${polygon.id}-layer`;
        try {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
          if (map.getSource(polygon.id)) {
            map.removeSource(polygon.id);
          }
        } catch (error) {
          console.error(`Error cleaning up polygon ${polygon.id}:`, error);
        }
      });
    });

    sourcesRef.current.clear();
  }, [mapInstance, cleanupLine, projects]);

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

    projects.forEach((project) => {
      project.polygons.forEach((polygon) => {
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
                coordinates: polygon.coordinates
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
              'line-color': polygon.style?.lineColor || project.style?.lineColor || POLYGON_STYLES.line.color,
              'line-width': polygon.style?.lineWidth || project.style?.lineWidth || POLYGON_STYLES.line.width,
              'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.8,
                polygon.style?.lineOpacity || project.style?.lineOpacity || POLYGON_STYLES.line.opacity
              ]
            }
          });

          // Animated dashed line if lineDashArray is specified
          const lineDashArray = polygon.style?.lineDashArray || project.style?.lineDashArray;
          if (lineDashArray) {
            map.addLayer({
              id: `${polygon.id}-line-dashed`,
              type: "line",
              source: polygon.id,
              paint: {
                'line-color': polygon.style?.lineColor || project.style?.lineColor || POLYGON_STYLES.line.color,
                'line-width': polygon.style?.lineWidth || project.style?.lineWidth || POLYGON_STYLES.line.width,
                'line-dasharray': lineDashArray || [2, 2]
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
      });
    });

    return () => {
      cleanupLayersAndSources();
    };
  }, [mapInstance, cleanupLayersAndSources, projects]);

  // Render polygon layers
  return (
    <>
       {projects.map((project) => 
        project.polygons.map((polygon) => {
          if (polygon.type === "LineString") return null;

          const { coordinates } = polygon
          if (!coordinates) return null;
          
          return (
            <Source 
             
              key={polygon.id}
              id={polygon.id}
              type="geojson" 
              data={{
                type: "Feature",
                properties: {
                  id: polygon.id,
                  projectId: project.id,
                  name: polygon.name
                },
                geometry: {
                  type: polygon.type,
                  coordinates: [coordinates
                  ]
                }
              }}
            >
              <Layer 
                id={`${polygon.id}-layer`}
                type="fill"
                paint={{
                  'fill-color': polygon.style?.fillColor || '#ff0000',
                  'fill-opacity': 0.5,
                  'fill-outline-color': '#000000'
                }}
              />
            </Source>
          );
        })
      )}
      
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
      
      {selectedProject && (
        <ProjectDetailsModal 
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          project={selectedProject}
        />
      )}
    </>
  );
};

export default ProjectPolygons;