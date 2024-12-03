
// export type MapConfig = {
//     style: string;
//     projection: string;
//     center: [number, number];
//     zoom: number;
//   }
  
//   export type FeatureCollection = {
//     type: 'FeatureCollection';
//     features: MapFeature[];
//   }
  
//   export interface MapStyle {
//     background?: {
//       type: 'line';
//       paint: {
//         'line-color': string;
//         'line-width': number;
//         'line-opacity': number;
//       };
//       layout: {
//         'line-cap': 'round' | 'butt' | 'square';
//         'line-join': 'round' | 'bevel' | 'miter';
//       };
//     };
//     dashed?: {
//       type: 'line';
//       paint: {
//         'line-color': string;
//         'line-width': number;
//         'line-dasharray': number[];
//       };
//     };
//     paint?: {
//       'fill-color'?: string;
//       'hover-fill-color'?: string;
//       'fill-opacity'?: number;
//       'hover-fill-opacity'?: number;
//     };
//   }

//   export interface ProjectDetails {
//     Location?: string;
//     Department?: string;
//     [key: string]: string | undefined;
//   }

//   export interface FeatureProperties {
//     id: string;
//     name: string;
//     lng: number;
//     lat: number;
//     hiddenAnchor: boolean;
//     noHover: boolean;
//     description?: string;
//     image?: string;
//     url?: string;
//     details?: ProjectDetails;
//     style: MapStyle;
//   }

//   export type FeatureGeometry = {
//     type: 'Polygon' | 'LineString';
//     coordinates: number[][][] | number[][];
//   };
  
//   export interface MapFeature {
//     type: 'Feature';
//     properties: FeatureProperties;
//     geometry: FeatureGeometry;
//   }
  
//   // Add other types as needed