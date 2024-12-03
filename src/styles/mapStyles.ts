export const defaultStyles = {
    polygon: {
      paint: {
        'fill-color': '#3288bd',
        'fill-opacity': 0.5,
        'hover-fill-opacity': 0.8,
      }
    },
    line: {
      background: {
        type: 'line' as const,
        paint: {
          'line-color': 'green',
          'line-width': 6,
          'line-opacity': 0.4
        },
        layout: {
          'line-cap': 'round' as const,
          'line-join': 'round' as const
        }
      },
      dashed: {
        type: 'line' as const,
        paint: {
          'line-color': '#FFD700',
          'line-width': 6,
          'line-dasharray': [0, 4, 3]
        }
      }
    }
  };

export const ANIMATION_CONFIG = {
  SECONDS_PER_REVOLUTION: 120,
  MAX_SPIN_ZOOM: 5,
  SLOW_SPIN_ZOOM: 8,
  DASH_ARRAY_SEQUENCE: [
    [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2],
    [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5],
    [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3],
    [0, 1.5, 3, 2.5], [0, 2, 3, 2],
    [0, 2.5, 3, 1.5], [0, 3, 3, 1],
    [0, 3.5, 3, 0.5]
  ]
};

export const POLYGON_STYLES = {
  default: {
    opacity: 0.3,
    color: '#3288bd',
  },
  hover: {
    opacity: 0.6,
    color: '#ffffff'
  }
};
