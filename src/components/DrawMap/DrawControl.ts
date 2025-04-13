import { Feature as MapFeature } from "@/types/map";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";

import type { ControlPosition, MapRef } from "react-map-gl";

interface Feature extends MapFeature {
	id: string;
}

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
	position?: ControlPosition;
	onCreate?: (evt: { features: Feature[] }) => void;
	onUpdate?: (evt: { features: Feature[]; action: string }) => void;
	onDelete?: (evt: { features: Feature[] }) => void;
};

export default function DrawControl(props: DrawControlProps) {
	useControl<any>(
		() => new (MapboxDraw as any)(props),
		context => {
			const map = context.map as MapRef;
			if (props.onCreate) map.on("draw.create", props.onCreate);
			if (props.onUpdate) map.on("draw.update", props.onUpdate);
			if (props.onDelete) map.on("draw.delete", props.onDelete);
		},
		{
			position: props.position,
		}
	);
	return null;
}

DrawControl.defaultProps = {
	onCreate: () => {},
	onUpdate: () => {},
	onDelete: () => {},
};
