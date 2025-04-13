"use client";
import { Box, Button, CircularProgress, FormControlLabel, Switch, TextField } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProjectPage() {
	const router = useRouter();
	const params = useParams();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		lat: "",
		lng: "",
		zoom: 12,
		hideMarker: false,
		isVisible: true,
		clientId: params.clientId,
	});

	useEffect(() => {
		const fetchProject = async () => {
			try {
				const response = await fetch(`/api/projects/${params.projectId}`);
				if (!response.ok) throw new Error("Failed to fetch project");

				const data = await response.json();
				setFormData({
					...data,
					lat: data.lat.toString(),
					lng: data.lng.toString(),
				});
			} catch (error) {
				console.error("Error fetching project:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProject();
	}, [params.projectId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const response = await fetch(`/api/projects/${params.projectId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					lat: parseFloat(formData.lat),
					lng: parseFloat(formData.lng),
				}),
			});

			if (!response.ok) throw new Error("Failed to update project");

			router.push(`/projects/${params.clientSlug}`);
		} catch (error) {
			console.error("Error updating project:", error);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<Box className="flex justify-center items-center h-screen">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Edit Project</h1>

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
						{loading ? <CircularProgress size={24} /> : "Save Changes"}
					</Button>
				</div>
			</form>
		</Box>
	);
}
