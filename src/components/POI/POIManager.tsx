import { MAP_CONFIG, MAPBOX_TOKEN } from "@/constants/mapConstants";
import { usePOIs } from "@/hooks/usePOIs";
import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Map } from "react-map-gl";
import { POIForm, POIFormData } from "./POIForm";
import { POIList } from "./POIList";
import { POIMap } from "./POIMap";
import { POITypeManager } from "./POITypeManager";

export const POIManager: React.FC = () => {
	const { pois, selectedPOI, selectedTypes, setSelectedPOI, fetchPOIs, togglePOIType } = usePOIs();

	const [isAddingMode, setIsAddingMode] = useState(false);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingPOI, setEditingPOI] = useState<POIFormData | null>(null);
	const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);

	// Fetch POIs when selected types change
	useEffect(() => {
		fetchPOIs();
	}, [fetchPOIs, selectedTypes]);

	const handleEditPOI = (poi: (typeof pois)[0]) => {
		setEditingPOI({
			title: poi.title,
			lat: poi.lat,
			lng: poi.lng,
			type: poi.type.name,
		});
		setIsFormOpen(true);
	};

	const handleDeletePOI = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this POI?")) {
			try {
				const response = await fetch(`/api/pois/${id}`, {
					method: "DELETE",
				});
				if (!response.ok) throw new Error("Failed to delete POI");
				await fetchPOIs();
			} catch (error) {
				console.error("Error deleting POI:", error);
			}
		}
	};

	const handleAddPOI = () => {
		setIsAddingMode(true);
		setTempMarker(null);
		setIsFormOpen(false);
		setEditingPOI(null);
	};

	// Update the handleMapClick function
	const handleMapClick = (lat: number, lng: number) => {
		if (isAddingMode) {
			setTempMarker({ lat, lng });
			setEditingPOI({
				title: "",
				lat,
				lng,
				type: "store", // default type
			});
			setIsFormOpen(true);
			setIsAddingMode(false);
		}
	};

	// Update the handleFormSubmit function
	const handleFormSubmit = async (data: POIFormData) => {
		try {
			const url = editingPOI?.id ? `/api/pois/${editingPOI.id}` : "/api/pois";
			const method = editingPOI?.id ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) throw new Error("Failed to save POI");

			await fetchPOIs();
			setIsFormOpen(false);
			setEditingPOI(null);
			setTempMarker(null);
		} catch (error) {
			console.error("Error saving POI:", error);
		}
	};
	return (
		<div className="flex h-screen">
			{/* Map Section */}
			<div className="flex-1 relative">
				<Map
					initialViewState={{
						longitude: MAP_CONFIG.initialViewState.longitude,
						latitude: MAP_CONFIG.initialViewState.latitude,
						zoom: 8,
					}}
					mapboxAccessToken={MAPBOX_TOKEN}
					style={{ width: "100%", height: "100%" }}
					mapStyle="mapbox://styles/mapbox/standard-satellite">
					<POIMap
						pois={pois}
						onPOIClick={setSelectedPOI}
						onMapClick={handleMapClick}
						selectedPOI={selectedPOI}
						isAddingMode={isAddingMode}
						tempMarker={tempMarker}
					/>
				</Map>

				{/* Add POI Button */}
				<button
					onClick={handleAddPOI}
					className={`
            absolute top-4 left-4 z-10 px-4 py-2 rounded-lg
            flex items-center space-x-2
            ${isAddingMode ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
            text-white transition-colors
          `}>
					{isAddingMode ? (
						<>
							<X className="w-4 h-4" />
							<span>Cancel</span>
						</>
					) : (
						<>
							<Plus className="w-4 h-4" />
							<span>Add POI</span>
						</>
					)}
				</button>
			</div>

			{/* Sidebar */}
			<div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
				<div className="p-4">
					<POITypeManager selectedTypes={selectedTypes} onTypeToggle={togglePOIType} />

					<div className="mt-6">
						<h3 className="text-lg font-medium mb-4">Points of Interest</h3>
						<POIList
							pois={pois}
							onEdit={handleEditPOI}
							onDelete={handleDeletePOI}
							onSelect={setSelectedPOI}
							selectedPOI={selectedPOI}
						/>
					</div>
				</div>
			</div>

			{/* POI Form Modal */}
			{isFormOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">{editingPOI?.id ? "Edit POI" : "Add POI"}</h2>
							<button
								onClick={() => {
									setIsFormOpen(false);
									setEditingPOI(null);
									setTempMarker(null);
									setIsAddingMode(false);
								}}
								className="text-gray-500 hover:text-gray-700">
								<X className="w-6 h-6" />
							</button>
						</div>
						<POIForm onSubmit={handleFormSubmit} initialData={editingPOI || undefined} isEdit={!!editingPOI?.id} />
					</div>
				</div>
			)}
		</div>
	);
};
