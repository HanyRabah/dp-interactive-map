import { Layer, MapMouseEvent, Source, useMap } from "react-map-gl";
import { ProjectsData } from "@/data/ProjectsData";
import { useEffect, useState, useCallback, useRef } from 'react';
import {  motion } from 'framer-motion';
import { ANIMATION_CONFIG, POLYGON_STYLES} from "@/styles/mapStyles";
import { HoveredFeature, MapFeature, ProjectProperties } from "@/types/map";
import ProjectDetailsModal from "./ProjectDetailsModal";

const ProjectPolygons = () => {
  const { current: mapInstance } = useMap();
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredFeature | null>(null);
  const sourcesRef = useRef<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<ProjectProperties | null>(null);
  const animationFramesRef = useRef<{ [key: string]: number }>({});

  // cleanup line
  const cleanupLine = useCallback((map: mapboxgl.Map, id: string) => {
    try {
      // Cancel animation frame if it exists
      if (animationFramesRef.current[id]) {
        cancelAnimationFrame(animationFramesRef.current[id]);
        delete animationFramesRef.current[id];
      }

      // Remove layers first
      if (map.getLayer(`${id}-line-dashed`)) {
        map.setLayoutProperty(`${id}-line-dashed`, 'visibility', 'none');
        map.removeLayer(`${id}-line-dashed`);
      }
      if (map.getLayer(`${id}-line-background`)) {
        map.removeLayer(`${id}-line-background`);
      }

      // Then remove source
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

    // Clean up all lines
    Array.from(sourcesRef.current).forEach(id => {
      cleanupLine(map, id);
    });

    // Clean up remaining polygon layers
    ProjectsData.features.forEach(feature => {
      const id = feature.properties?.id;
      if (!id) return;

      try {
        if (map.getLayer(`${id}-layer`)) {
          map.removeLayer(`${id}-layer`);
        }
        if (map.getSource(id)) {
          map.removeSource(id);
        }
      } catch (error) {
        console.error(`Error cleaning up polygon ${id}:`, error);
      }
    });

    sourcesRef.current.clear();
  }, [mapInstance, cleanupLine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!mapInstance) return;
      
      // Cancel all animations first
      Object.values(animationFramesRef.current).forEach(frame => {
        cancelAnimationFrame(frame);
      });
      animationFramesRef.current = {};

      cleanupLayersAndSources();
    };
  }, [mapInstance, cleanupLayersAndSources]);

   // Add line layers
   useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();
  
    // Clean up existing sources and layers first
    cleanupLayersAndSources();
  
    ProjectsData.features.forEach((feature) => {
      if (feature.geometry.type !== "LineString") return;
  
      const { id, style } = feature.properties;
      
      try {
        // Add new source
        map.addSource(id, {
          type: "geojson",
          data: {
            ...feature,
            id: 0
          }
        });
        sourcesRef.current.add(id);
  
        // Add background line
        map.addLayer({
          id: `${id}-line-background`,
          type: "line",
          source: id,
          ...style.background,
          paint: {
            ...style.background?.paint,
            'line-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8,
              0.4
            ]
          }
        });
  
        // Add dashed line with animation
        if (style.dashed) {
          map.addLayer({
            id: `${id}-line-dashed`,
            source: id,
            ...style.dashed
          });
  
          let step = 0;
  
          const animate = (timestamp: number) => {
            // Check if layer still exists before animating
            if (!map.getLayer(`${id}-line-dashed`)) {
              if (animationFramesRef.current[id]) {
                cancelAnimationFrame(animationFramesRef.current[id]);
                delete animationFramesRef.current[id];
              }
              return;
            }
  
            const newStep = parseInt((timestamp / 50) % ANIMATION_CONFIG.DASH_ARRAY_SEQUENCE.length as any);
            
            if (newStep !== step) {
              try {
                map.setPaintProperty(
                  `${id}-line-dashed`,
                  'line-dasharray',
                  ANIMATION_CONFIG.DASH_ARRAY_SEQUENCE[newStep]
                );
                step = newStep;
              } catch (error) {
                console.error(`Error updating dash array for ${id}:`, error);
                return;
              }
            }
  
            animationFramesRef.current[id] = requestAnimationFrame(animate);
          };
  
          animationFramesRef.current[id] = requestAnimationFrame(animate);
        }
      } catch (error) {
        console.error(`Error adding line layers for ${id}:`, error);
      }
    });
  
    return () => {
      cleanupLayersAndSources();
    };
  }, [mapInstance, cleanupLayersAndSources]);

  // Hover handling
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance.getMap();

    const handleClick = (e: MapMouseEvent) => {
      const polygonLayers = ProjectsData.features
        .filter(f => f.geometry.type !== "LineString")
        .map(f => `${f.properties?.id}-layer`);

      const features = map.queryRenderedFeatures(e.point, {
        layers: polygonLayers
      });

      if (features.length > 0) {
        const feature = features[0];
        const { properties } = feature;
        
        if (properties && !properties.noHover) {
          setSelectedProject(properties as ProjectProperties);
        }
      }
    };

    const handleHover = (e: MapMouseEvent) => {
      const polygonLayers = ProjectsData.features
      .filter(f => f.geometry.type !== "LineString")
      .map(f => `${f.properties?.id}-layer`);

    const lineLayers = ProjectsData.features
      .filter(f => f.geometry.type === "LineString")
      .map(f => `${f.properties?.id}-line-background`);

      const allLayers = [...polygonLayers, ...lineLayers];
      
      const features = map.queryRenderedFeatures(e.point,  {
        layers: allLayers
      });

      // Clear previous hover state
      if (hoveredFeatureId) {
        map.setFeatureState(
          { source: hoveredFeatureId, id: 0 },
          { hover: false }
        );
      }

      // Set new hover state
      if (features.length > 0) {
        const feature = features[0];
        const { properties } = feature;
        
        if (properties && !properties.noHover) {
          const sourceId = properties.id;
          map.setFeatureState(
            { source: sourceId, id: 0 },
            { hover: true }
          );

          setHoveredFeatureId(sourceId);
          setHoveredTooltip({
            name: properties.name,
            x: e.point.x,
            y: e.point.y,
            properties
          });

          map.getCanvas().style.cursor = 'pointer';
          return;
        }
      }

      map.getCanvas().style.cursor = '';
      setHoveredFeatureId(null);
      setHoveredTooltip(null);
    };

    map.on('click', handleClick);
    map.on('mousemove', handleHover);
    map.on('mouseleave', () => {
      if (hoveredFeatureId) {
        map.setFeatureState(
          { source: hoveredFeatureId, id: 0 },
          { hover: false }
        );
      }
      setHoveredFeatureId(null);
      setHoveredTooltip(null);
    });

    return () => {
      map.off('click', handleClick);
      map.off('mousemove', handleHover);
      map.off('mouseleave', () => {});
    };
  }, [mapInstance, hoveredFeatureId]);

  // Render polygon layer
  const renderPolygonLayer = useCallback((feature: MapFeature) => {
    const { id, style } = feature.properties;

    return (
      <Source 
        key={id}
        id={id}
        type="geojson" 
        data={{
          ...feature,
          id: 0
        }}
      >
        <Layer 
          id={`${id}-layer`}
          type="fill"
          paint={{
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              style.paint && style.paint['hover-fill-color'] || POLYGON_STYLES.hover.color,
              style.paint && style.paint['fill-color'] || POLYGON_STYLES.default.color
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              style.paint && style.paint['hover-fill-opacity'] || POLYGON_STYLES.hover.opacity,
              style.paint && style.paint['fill-opacity'] || POLYGON_STYLES.default.opacity
            ],
          }}
        />
      </Source>
    );
  }, []);

  return (
    <>
      {ProjectsData.features.map((feature) => {
        if (feature.geometry.type === "LineString") return null;
        return renderPolygonLayer(feature as MapFeature);
      })}
      
      {hoveredTooltip && (
        <motion.div 
          className='absolute z-20 pointer-events-none'
          style={{ 
            left: hoveredTooltip.x, 
            top: hoveredTooltip.y - 10
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className='bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-lg border border-white/20 transform -translate-x-1/2 -translate-y-full'>
            <p className='text-sm font-medium text-gray-900 whitespace-nowrap'>
              {hoveredTooltip.name}
            </p>
            {hoveredTooltip.properties?.description && (
              <p className="text-xs text-gray-600 mt-1">
                {hoveredTooltip.properties.description}
              </p>
            )}
            <div className='absolute -bottom-2 left-1/2 w-4 h-4 bg-white/90 transform rotate-45 -translate-x-1/2 border-r border-b border-white/20' />
          </div>
        </motion.div>
      )}
      <ProjectDetailsModal 
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
      />
    </>
  );
};

export default ProjectPolygons;