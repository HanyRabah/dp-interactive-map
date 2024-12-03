const MAP_CENTER = { lat: 30.0764406, lng: 31.4596637 };

const initialViewState = {
  latitude: MAP_CENTER.lat,
  longitude: MAP_CENTER.lng,
  zoom: 1,
  bearing: 0,
  pitch: 0,
};

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export const MAP_CONFIG = {
  initialViewState,
  spinSpeed: 0.5,
  projects: [
    {
      id: "project1",
      lat: 24.774265,
      lng: 46.738586,
      zoom: 5,
      name: "NEOM Project"
    }
  ]
};
