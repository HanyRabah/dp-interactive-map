// types/drawMap.ts

import { PolygonStyle, ProjectDetails } from "@prisma/client";

/**
 * Map editing modes
 */
export enum MODES {
	VIEW = "view",
	DRAW = "draw",
	EDIT = "edit",
	MARKER = "marker",
}

export type Mode = MODES.VIEW | MODES.DRAW | MODES.EDIT | MODES.MARKER;

/**
 * GeoJSON Feature type
 */
export interface Feature {
	id: string;
	type: "Feature";
	geometry: {
		type: "Polygon" | "MultiPolygon" | "Point" | "LineString";
		coordinates: number[][][] | number[][];
	};
	properties?: {
		name?: string;
		lng?: number;
		lat?: number;
		hiddenAnchor?: boolean;
		type?: "Polygon" | "MultiPolygon" | "Point" | "LineString";
		description?: string;
		style?: PolygonStyle;
		image?: string;
		url?: string;
		details?: ProjectDetails;
	};
}

/**
 * Map configuration type
 */
export interface MapConfig {
	initialViewState: {
		latitude: number;
		longitude: number;
		zoom: number;
		bearing?: number;
		pitch?: number;
	};
	style?: string;
	mapboxAccessToken: string;
}

// types.ts
export interface Marker {
	id: string;
	longitude: number;
	latitude: number;
	name: string;
}

export type FeatureNames = Record<string, string>;
