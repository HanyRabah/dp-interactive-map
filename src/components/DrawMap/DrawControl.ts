import MapboxDraw from '@mapbox/mapbox-gl-draw';
import {useControl} from 'react-map-gl';

import type {MapRef, ControlPosition} from 'react-map-gl';

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  onCreate?: (evt: {features: object[]}) => void;
  onUpdate?: (evt: {features: object[]; action: string}) => void;
  onDelete?: (evt: {features: object[]}) => void;
};

export default function DrawControl(props: DrawControlProps) {
  useControl<MapboxDraw>(
    () => new MapboxDraw(props),
    ({map}: {map: MapRef}) => {
      if (props.onCreate) map.on('draw.create', props.onCreate);
      if (props.onUpdate) map.on('draw.update', props.onUpdate);
      if (props.onDelete) map.on('draw.delete', props.onDelete);
    },
    ({map}: {map: MapRef}) => {
      if (props.onCreate) map.off('draw.create', props.onCreate);
      if (props.onUpdate) map.off('draw.update', props.onUpdate);
      if (props.onDelete) map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position
    }
  );
  return null;
}

DrawControl.defaultProps = {
  onCreate: () => {},
  onUpdate: () => {},
  onDelete: () => {}
};


// import MapboxDraw from '@mapbox/mapbox-gl-draw';
// import {useControl} from 'react-map-gl';
// import type {MapRef, ControlPosition} from 'react-map-gl';
// import { MapContextValue } from 'react-map-gl/dist/esm/components/map';

// type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
//   position?: ControlPosition;

//   onCreate?: (evt: {features: object[]}) => void;
//   onUpdate?: (evt: {features: object[]; action: string}) => void;
//   onDelete?: (evt: {features: object[]}) => void;
// };

// export default function DrawControl(props: DrawControlProps) {
  
//   useControl<any>(
//     () => new (MapboxDraw as any)(props),
//     (context: MapContextValue) => {
//       const map = context.map as MapRef;
//       if (props.onCreate) map.on('draw.create', props.onCreate);
//       if (props.onUpdate) map.on('draw.update', props.onUpdate);
//       if (props.onDelete) map.on('draw.delete', props.onDelete);
//     },
//     (context: MapContextValue) => {
//       const map = context.map as MapRef;
//       if (props.onCreate) map.off('draw.create', props.onCreate);
//       if (props.onUpdate) map.off('draw.update', props.onUpdate);
//       if (props.onDelete) map.off('draw.delete', props.onDelete);
//     },
//     {
//       position: props.position
//     }
//   );

//   return null;
// }

// DrawControl.defaultProps = {
//   onCreate: () => {},
//   onUpdate: () => {},
//   onDelete: () => {}
// };