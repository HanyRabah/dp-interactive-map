// types/projects.ts

/**
 * Polygon style properties
 */
export interface PolygonStyle {
	id?: string;
	fillColor?: string;
	hoverFillColor?: string;
	fillOpacity?: number;
	hoverFillOpacity?: number;
	lineColor?: string;
	lineWidth?: number;
	lineOpacity?: number;
	lineDashArray?: string;
	polygonId?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Popup details for a polygon
 */
export interface PopupDetails {
	id?: string;
	title?: string;
	image?: string;
	description?: string;
	link?: string;
	imagesLink?: string;
	videoLink?: string;
	ariealLink?: string;
	type?: "details" | "link";
}

/**
 * Polygon entity
 */
export interface Polygon {
	id: string;
	name: string;
	description?: string;
	type: "Polygon" | "MultiPolygon" | "Point" | "LineString";
	coordinates: string;
	projectId?: string;
	minZoom?: number;
	maxZoom?: number;
	createdAt?: Date;
	updatedAt?: Date;
	style?: PolygonStyle;
	popupDetails?: PopupDetails;
	popupDetailsId?: string;
}

/**
 * Feature type for MapboxDraw
 */
export interface Feature {
	id: string;
	type: "Feature";
	geometry: {
		type: string;
		coordinates: number[][][] | number[][];
	};
	properties?: {
		name?: string;
		description?: string;
		style?: Partial<PolygonStyle>;
		popupDetails?: Partial<PopupDetails>;
		[key: string]: any;
	};
}

/**
 * Project form data type
 */
export interface ProjectFormData {
	id: string;
	name: string;
	description?: string;
	lat: number;
	lng: number;
	zoom: number;
	hideMarker: boolean;
	polygon: Polygon | null;
	[key: string]: any;
}
