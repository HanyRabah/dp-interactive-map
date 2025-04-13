"use client";
import { Box, Button, CircularProgress, FormControlLabel, Switch, TextField } from "@mui/material";
import _ from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DrawPolygon from "./DrawPolygon/index";

export default function ProjectForm() {
	const router = useRouter();
	const params = useParams();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [initialFormData, setInitialFormData] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		lat: "",
		lng: "",
		zoom: 12,
		hideMarker: false,
		isVisible: true,
		clientId: params.clientId,
		polygon: null,
	});

	useEffect(() => {
		if (!params.projectId) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const fetchProject = async () => {
			try {
				const response = await fetch(`/api/projects/${params.projectId}`);
				if (!response.ok) throw new Error("Failed to fetch project");

				const data = await response.json();
				setInitialFormData({
					...data,
					lat: data.lat.toString(),
					lng: data.lng.toString(),
				});
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
		// check if it is a new project or an existing one
		const isNewProject = !params.projectId;
		const url = isNewProject ? "/api/projects" : `/api/projects/${params.projectId}`;
		const method = isNewProject ? "POST" : "PUT";

		const body = {
			...formData,
			zoom: parseInt(formData.zoom.toString()),
			lat: parseFloat(formData.lat),
			lng: parseFloat(formData.lng),
		};
		if (isNewProject) {
			body.clientId = params.clientId;
		}
		if (formData.polygon) {
			body.polygon = formData.polygon;
		}
		try {
			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) throw new Error(isNewProject ? "Failed to create project" : "Failed to update project");

			router.push(`/projects/${params.clientId}`);
		} catch (error) {
			console.error("Error creating/updating project:", error);
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

	const noChanges = _.isEqual(initialFormData, formData);

	return (
		<Box className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">{params.projectId ? "Edit Project" : "Add Project"}</h1>

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
					label="Project Description"
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
						label="Project Latitude"
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
						label="Project Longitude"
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
					label="Project Zoom Level"
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
					{/* <FormControlLabel
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
						label="Hide project marker"
					/> */}

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
						label="Project is visible on map"
					/>
				</div>

				<DrawPolygon polygons={formData.polygon} />

				<div className="flex justify-end gap-4">
					<Button variant="outlined" onClick={() => router.back()} disabled={saving}>
						Cancel
					</Button>
					<Button type="submit" variant="contained" disabled={saving || noChanges}>
						{saving ? <CircularProgress size={24} /> : params.projectId ? "Save Changes" : "Create Project"}
					</Button>
				</div>
			</form>
		</Box>
	);
}
