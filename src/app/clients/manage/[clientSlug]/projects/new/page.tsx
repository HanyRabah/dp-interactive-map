"use client";
import { Box, Button, CircularProgress, FormControlLabel, Switch, TextField } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectPage() {
	const router = useRouter();
	const params = useParams();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		lat: "",
		lng: "",
		zoom: 12,
		hideMarker: false,
		isVisible: true,
		clientId: params.clientSlug,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch("/api/projects", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					id: params.clientSlug,
					zoom: parseInt(formData.zoom.toString()),
					lat: parseFloat(formData.lat),
					lng: parseFloat(formData.lng),
				}),
			});

			if (!response.ok) throw new Error("Failed to create project");

			router.push(`/clients/	/${params.clientSlug}/projects`);
		} catch (error) {
			console.error("Error creating project:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Create New Project</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<TextField
					fullWidth
					label="Project Name"
					value={formData.name}
					onChange={e =>
						setFormData(prev => ({
							...prev,
							name: e.target.value,
						}))
					}
					required
				/>

				<TextField
					fullWidth
					multiline
					rows={3}
					label="Description"
					value={formData.description}
					onChange={e =>
						setFormData(prev => ({
							...prev,
							description: e.target.value,
						}))
					}
				/>

				<div className="grid grid-cols-2 gap-4">
					<TextField
						fullWidth
						label="Latitude"
						type="number"
						value={formData.lat}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								lat: e.target.value,
							}))
						}
						required
						inputProps={{ step: "any" }}
					/>

					<TextField
						fullWidth
						label="Longitude"
						type="number"
						value={formData.lng}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								lng: e.target.value,
							}))
						}
						required
						inputProps={{ step: "any" }}
					/>
				</div>

				<TextField
					fullWidth
					label="Zoom Level"
					type="number"
					value={formData.zoom}
					onChange={e =>
						setFormData(prev => ({
							...prev,
							zoom: parseInt(e.target.value),
						}))
					}
					required
				/>

				<div className="space-y-2">
					<FormControlLabel
						control={
							<Switch
								checked={formData.hideMarker}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										hideMarker: e.target.checked,
									}))
								}
							/>
						}
						label="Hide Marker"
					/>

					<FormControlLabel
						control={
							<Switch
								checked={formData.isVisible}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										isVisible: e.target.checked,
									}))
								}
							/>
						}
						label="Visible on Map"
					/>
				</div>

				<div className="flex justify-end gap-4">
					<Button variant="outlined" onClick={() => router.back()} disabled={loading}>
						Cancel
					</Button>
					<Button type="submit" variant="contained" disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Create Project"}
					</Button>
				</div>
			</form>
		</Box>
	);
}
