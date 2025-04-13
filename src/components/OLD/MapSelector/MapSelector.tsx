"use client";
import { MAPBOX_TOKEN, MAP_CONFIG } from "@/constants/mapConstants";
import { useRef, useState } from "react";
import Map, { MapRef, Marker } from "react-map-gl";

interface MapSelectorProps {
	onLocationSelect: (location: { lat: number; lng: number }) => void;
}

const MapSelector = ({ onLocationSelect }: MapSelectorProps) => {
	const mapRef = useRef<MapRef>(null);
	const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

	const handleClick = (event: mapboxgl.MapLayerMouseEvent) => {
		const { lngLat } = event;
		setMarkerPosition({ lat: lngLat.lat, lng: lngLat.lng });
		onLocationSelect({ lat: lngLat.lat, lng: lngLat.lng });
	};

	return (
		<Map
			ref={mapRef}
			initialViewState={MAP_CONFIG.initialViewState}
			style={{ width: "100%", height: "100%" }}
			mapStyle="mapbox://styles/mapbox/satellite-v9"
			mapboxAccessToken={MAPBOX_TOKEN}
			onClick={handleClick}>
			{markerPosition && <Marker latitude={markerPosition.lat} longitude={markerPosition.lng} color="#FF0000" />}
		</Map>
	);
};

export default MapSelector;
