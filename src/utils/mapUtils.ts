import { MapFeature } from '@/types/map';

export const cleanupMapLayers = (map: mapboxgl.Map, feature: MapFeature) => {
  const { id } = feature.properties;
  
  if (map.getLayer(`${id}-line-dashed`)) {
    map.removeLayer(`${id}-line-dashed`);
  }
  if (map.getLayer(`${id}-line-background`)) {
    map.removeLayer(`${id}-line-background`);
  }
  if (map.getSource(id)) {
    map.removeSource(id);
  }
};

export const getVisibleFeatures = (features: MapFeature[]): MapFeature[] => {
  return features.filter(feature => !feature.properties.hiddenAnchor);
};

export const getLineFeatures = (features: MapFeature[]): MapFeature[] => {
  return features.filter(feature => feature.geometry.type === 'LineString');
};

export const getPolygonFeatures = (features: MapFeature[]): MapFeature[] => {
  return features.filter(feature => feature.geometry.type === 'Polygon');
};