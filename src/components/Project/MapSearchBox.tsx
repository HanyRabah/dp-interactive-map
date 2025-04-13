import { useMapSearch } from "@/hooks/useMapSearch";
import { Box, Button, Input } from "@mui/material";
import { Search, X } from "lucide-react";

interface Props {
	flyTo: (center: [number, number]) => void;
}

const MapSearchBox = ({ flyTo }: Props) => {
	const { query, setQuery, results, isSearching, handleSearch, clearSearch } = useMapSearch();

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleSearch();
	};

	return (
		<Box sx={{ position: "absolute", top: 10, left: 10, width: 300, zIndex: 10 }}>
			<Box sx={{ position: "relative" }}>
				<Input
					type="text"
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Search location..."
					fullWidth
					sx={{
						backgroundColor: "#fff",
						borderRadius: 2,
						px: 2,
						py: 1,
						boxShadow: 1,
					}}
				/>
				<Button
					onClick={handleSearch}
					disabled={!query}
					sx={{
						position: "absolute",
						right: 0,
						top: "50%",
						transform: "translateY(-50%)",
					}}>
					<Search size={20} />
				</Button>
			</Box>

			{isSearching && results.length > 0 && (
				<Box className="bg-white rounded shadow mt-1 max-h-[300px] overflow-y-auto">
					<Box className="p-2 flex justify-between items-center border-b">
						<span className="text-sm font-semibold">Search Results</span>
						<button onClick={clearSearch}>
							<X size={16} className="text-gray-500 hover:text-gray-700" />
						</button>
					</Box>
					{results.map(result => (
						<button
							key={result.id}
							className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
							onClick={() => {
								flyTo(result.center);
								clearSearch();
							}}>
							{result.place_name}
						</button>
					))}
				</Box>
			)}
		</Box>
	);
};

export default MapSearchBox;
