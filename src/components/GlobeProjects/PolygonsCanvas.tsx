// components/CanvasPolygon.tsx
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl";

interface CanvasPolygonProps {
	coordinates: number[][][]; // Polygon coordinates (GeoJSON format)
	fillColor: string; // Fill color for the polygon
	fillOpacity: number; // Fill opacity for the polygon
	outlineColor: string; // Outline color for the polygon
}

const CanvasPolygon = ({ coordinates, fillColor, fillOpacity, outlineColor }: CanvasPolygonProps) => {
	console.log("🚀 ~ CanvasPolygon ~ coordinates:", coordinates);
	const { current: map } = useMap();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!map || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Resize canvas to match map size
		const resizeCanvas = () => {
			const { clientWidth, clientHeight } = map.getCanvas();
			canvas.width = clientWidth;
			canvas.height = clientHeight;
		};

		// Draw the polygon on the canvas
		const drawPolygon = () => {
			if (!ctx) return;

			// Clear the canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Convert geographic coordinates to pixel coordinates

			const pixelCoordinates = coordinates[0].map(coord => map.project([coord[0], coord[1]]));

			// Draw the polygon
			ctx.beginPath();
			pixelCoordinates.forEach((point, index) => {
				if (index === 0) {
					ctx.moveTo(point.x, point.y);
				} else {
					ctx.lineTo(point.x, point.y);
				}
			});
			ctx.closePath();

			// Fill the polygon
			ctx.fillStyle = fillColor;
			ctx.globalAlpha = fillOpacity;
			ctx.fill();

			// Draw the outline
			ctx.strokeStyle = outlineColor;
			ctx.lineWidth = 2;
			ctx.globalAlpha = 1;
			ctx.stroke();
		};

		// Initial setup
		resizeCanvas();
		drawPolygon();

		// Redraw on map move
		const onMove = () => {
			resizeCanvas();
			drawPolygon();
		};

		map.on("move", onMove);

		// Cleanup
		return () => {
			map.off("move", onMove);
		};
	}, [map, coordinates, fillColor, fillOpacity, outlineColor]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none", // Ensure the canvas doesn't block map interactions
			}}
		/>
	);
};

export default CanvasPolygon;
