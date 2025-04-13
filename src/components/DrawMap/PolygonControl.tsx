// components/DrawMap/FeatureList.tsx
import { Feature, FeatureNames } from "@/types/drawMap";
import DeleteButton from "./DeleteButton";

interface FeatureListProps {
	features: Record<string, Feature>;
	featureNames: FeatureNames;
	selectedFeature: Feature | null;
	onSelect: (feature: Feature) => void;
	onDelete: (featureId: string) => void;
	onNameChange: (featureId: string, name: string) => void;
}

export default function PolygonControl({
	features,
	featureNames,
	selectedFeature,
	onSelect,
	onDelete,
	onNameChange,
}: FeatureListProps) {
	return (
		<div className="space-y-2">
			{Object.values(features).map(feature => (
				<div
					key={feature.id}
					className={`p-3 rounded ${
						selectedFeature?.id === feature.id ? "bg-blue-100 border border-blue-300" : "bg-white hover:bg-gray-100"
					}`}>
					<div className="flex items-center justify-between">
						<div className="flex-1 cursor-pointer" onClick={() => onSelect(feature)}>
							<p className="font-medium">{featureNames[feature.id]}</p>
							<p className="text-sm text-gray-600">{JSON.stringify(feature.geometry.type)}</p>
						</div>
						<div className="flex items-center space-x-2">
							<input
								type="text"
								value={featureNames[feature.id] || ""}
								onChange={e => onNameChange(feature.id, e.target.value)}
								className="px-2 py-1 border rounded text-sm"
								onClick={e => e.stopPropagation()}
								placeholder="Name feature"
							/>
							<DeleteButton onClick={() => onDelete(feature.id)} type="feature" variant="inline" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
