// components/DrawMap/DrawControl.ts
import { Feature as MapFeature } from '@/types/map';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl';
import type { MapRef, ControlPosition } from 'react-map-gl';

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
  console.log("Initializing DrawControl with props:", props);

  useControl<any>(
    () => {
      const drawOptions = { ...props };
      console.log("Creating MapboxDraw with options:", drawOptions);
      return new (MapboxDraw as any)(drawOptions);
    },
    (context) => {
      const map = context.map as MapRef;
      console.log("Attaching event listeners to map...");

      if (props.onCreate) {
        map.on('draw.create', (evt) => {
          console.log("draw.create event triggered:", evt);
          props.onCreate?.(evt);
        });
      }
      if (props.onUpdate) {
        map.on('draw.update', (evt) => {
          console.log("draw.update event triggered:", evt);
          props.onUpdate?.(evt);
        });
      }
      if (props.onDelete) {
        map.on('draw.delete', (evt) => {
          console.log("draw.delete event triggered:", evt);
          props.onDelete?.(evt);
        });
      }
    },
    {
      position: props.position,
    }
  );

  return null;
}

DrawControl.defaultProps = {
  onCreate: (evt) => {
    console.log("Default onCreate triggered with features:", evt.features);
  },
  onUpdate: (evt) => {
    console.log("Default onUpdate triggered with features:", evt.features, "Action:", evt.action);
  },
  onDelete: (evt) => {
    console.log("Default onDelete triggered with features:", evt.features);
  },
};
