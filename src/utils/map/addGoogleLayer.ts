export const addGoogleSatelliteLayer = (map: mapboxgl.Map) => {
	if (map.getSource("google-satellite")) return;

	map.addSource("google-satellite", {
		type: "raster",
		tiles: ["https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
		tileSize: 256,
		minzoom: 0,
		maxzoom: 20,
	});

	const firstSymbolLayer = map.getStyle()?.layers?.find(l => l.type === "symbol")?.id;

	map.addLayer(
		{
			id: "google-satellite-layer",
			type: "raster",
			source: "google-satellite",
			paint: {
				"raster-opacity": 1,
				"raster-fade-duration": 1000,
			},
		},
		firstSymbolLayer
	);
};
