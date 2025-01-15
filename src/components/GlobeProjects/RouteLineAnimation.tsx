import { RouteInfo } from '@/types/poi';
import { useEffect, useState } from 'react';
import { Layer, Source } from 'react-map-gl';

// Helper function to interpolate points between two coordinates
const interpolatePoints = (start: [number, number], end: [number, number], numPoints: number) => {
  const interpolated: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = start[1] + (end[1] - start[1]) * t;
    const lng = start[0] + (end[0] - start[0]) * t;
    interpolated.push([lng, lat]);
  }
  return interpolated;
};

const RouteLineAnimation = ({ routeInfo }: { routeInfo: RouteInfo }) => {
  const [animatedGeometry, setAnimatedGeometry] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interpolatedCoordinates, setInterpolatedCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!routeInfo || !routeInfo[routeInfo.activeMode]?.geometry) return;

    const geometry = routeInfo[routeInfo.activeMode]!.geometry;
    const coordinates = geometry.coordinates;

    if (coordinates.length === 0) return;

    // Interpolate points between each pair of coordinates
    const newInterpolatedCoordinates: [number, number][] = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      const interpolated = interpolatePoints(start, end, 10); // Add 10 points between each pair
      newInterpolatedCoordinates.push(...interpolated);
    }

    setInterpolatedCoordinates(newInterpolatedCoordinates);
    setAnimatedGeometry({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    });
    setCurrentIndex(0);
  }, [routeInfo]);

  useEffect(() => {
    if (interpolatedCoordinates.length === 0) return;

    // Update the animated geometry as the index increases
    setAnimatedGeometry({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: interpolatedCoordinates.slice(0, currentIndex + 1),
      },
    });
  }, [currentIndex, interpolatedCoordinates]);

  useEffect(() => {
    if (interpolatedCoordinates.length === 0) return;

    // Start the animation
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= interpolatedCoordinates.length - 1) {
          clearInterval(interval); // Stop the animation when the line is fully drawn
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 20); // Adjust the interval for smoother or faster animation

    return () => clearInterval(interval);
  }, [interpolatedCoordinates]);

  if (!animatedGeometry) return null;

  return (
    <Source id="route" type="geojson" data={animatedGeometry}>
      <Layer
        id="route-line"
        type="line"
        paint={{
          'line-color': routeInfo.activeMode === 'driving' ? '#FF4136' : '#48bb78',
          'line-width': 3,
        }}
      />
    </Source>
  );
};

export default RouteLineAnimation;