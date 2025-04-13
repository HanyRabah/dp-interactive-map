import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useEffect } from "react";
import { MapRef } from "react-map-gl";

export const useInitializeMap = ({
	enabled,
	drawRef,
	mapRef,
	mode,
	onCreate,
	onUpdate,
	onDelete,
}: {
	enabled: boolean;
	drawRef: React.MutableRefObject<MapboxDraw | null>;
	mapRef: React.RefObject<MapRef>;
	mode: string;
	onCreate: (e: any) => void;
	onUpdate: (e: any) => void;
	onDelete: (e: any) => void;
}) => {
	useEffect(() => {
		if (!enabled || !mapRef.current) return;

		const map = mapRef.current.getMap();
		const draw = new MapboxDraw({
			displayControlsDefault: false,
			controls: {
				polygon: mode === "draw",
				trash: true,
			},
		});

		drawRef.current = draw;
		map.addControl(draw);

		map.on("draw.create", onCreate);
		map.on("draw.update", onUpdate);
		map.on("draw.delete", onDelete);

		return () => {
			map.off("draw.create", onCreate);
			map.off("draw.update", onUpdate);
			map.off("draw.delete", onDelete);
			if (map.hasControl(draw)) map.removeControl(draw);
		};
	}, [enabled, mapRef, drawRef, mode, onCreate, onUpdate, onDelete]);
};
