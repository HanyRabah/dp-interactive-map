import { useState } from "react";

export interface SearchResult {
	id: string;
	place_name: string;
	center: [number, number];
}

export const useMapSearch = () => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const handleSearch = async () => {
		if (!query.trim()) return;

		setIsSearching(true);
		try {
			const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
					query
				)}.json?access_token=${token}&limit=5`
			);

			const data = await response.json();
			const parsedResults = data.features.map((feature: any) => ({
				id: feature.id,
				place_name: feature.place_name,
				center: feature.center,
			}));

			setResults(parsedResults);
		} catch (err) {
			console.error("Search error:", err);
		}
	};

	const clearSearch = () => {
		setQuery("");
		setResults([]);
		setIsSearching(false);
	};

	return {
		query,
		setQuery,
		results,
		isSearching,
		handleSearch,
		clearSearch,
	};
};
