"use client";
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, Grid2 as Grid, TextField } from "@mui/material";
import { Client } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const uploadImage = async (file: File, clientName: string) => {
	const formData = new FormData();
	formData.append("logo", file);

	const clientNamePath = clientName.replace(/\s+/g, "-").toLowerCase();

	try {
		const response = await fetch(`/api/upload/image/${clientNamePath}`, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) throw new Error("Upload failed");

		const data = await response.json();
		return `/${clientNamePath}/${data.filename}`;
	} catch (error) {
		console.error("Error uploading Image:", error);
		throw error;
	}
};

export default function ClientForm({ client }: { client?: Client | null }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [ImageUploadig, setImageUploading] = useState(false);
	const [formData, setFormData] = useState({
		name: client?.name || "",
		slug: client?.slug || "",
		logo: client?.logo || "",
		lat: client?.lat || "",
		lng: client?.lng || "",
		isDefault: client?.isDefault || false,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const isEditing = Boolean(client?.name);
		if (isEditing) {
			try {
				const response = await fetch(`/api/clients/${client?.id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				if (!response.ok) throw new Error("Failed to update client");
				router.push("/clients");
			} catch (error) {
				console.error("Error creating client:", error);
			} finally {
				setLoading(false);
			}
			return;
		}

		if (!formData.name) {
			alert("Please enter a client name");
			setLoading(false);
			return;
		}

		const slug = formData.name.toLowerCase().replace(/\s+/g, "-");
		try {
			const response = await fetch("/api/clients", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...formData, slug }),
			});

			if (!response.ok) throw new Error("Failed to create client");

			router.push("/clients");
		} catch (error) {
			console.error("Error creating client:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setImageUploading(true);
		try {
			const imageUrl = await uploadImage(file, formData.name);
			setFormData(prev => ({
				...prev,
				logo: imageUrl,
			}));
		} catch (error) {
			console.error("Upload failed:", error);
		} finally {
			setImageUploading(false);
		}
	};

	return (
		<Box className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">{client?.name ? "Edit Client" : "Create New Client"}</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<TextField
					fullWidth
					label="Client Name"
					value={formData.name}
					onChange={e =>
						setFormData(prev => ({
							...prev,
							name: e.target.value,
						}))
					}
					required
				/>

				<Grid size={{ xs: 12 }}>
					<input
						type="file"
						accept="image/*"
						onChange={handleImageUpload}
						style={{ display: "none" }}
						id="client-image-upload"
					/>
					<label htmlFor="client-image-upload">
						<Button component="span" variant="outlined" disabled={ImageUploadig} fullWidth>
							{ImageUploadig ? "Uploading..." : "Upload Logo"}
						</Button>
					</label>
					{formData.logo && (
						<img src={`/clients/${formData.logo}`} alt="Client Logo" className="mt-4" style={{ width: "40%" }} />
					)}
				</Grid>

				<Box className="flex gap-4">
					<TextField
						fullWidth
						label="Latitude"
						value={formData.lat}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								lat: e.target.value,
							}))
						}
						required
					/>
					<TextField
						fullWidth
						label="Longitude"
						value={formData.lng}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								lng: e.target.value,
							}))
						}
						required
					/>
				</Box>
				<Box className="flex gap-4">
					<FormControlLabel
						control={
							<Checkbox
								checked={formData.isDefault || false}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										isDefault: e.target.checked,
									}))
								}
							/>
						}
						label="set as default client"
					/>
				</Box>

				<div className="flex justify-end gap-4">
					<Button variant="outlined" onClick={() => router.back()} disabled={loading}>
						Cancel
					</Button>
					<Button type="submit" variant="contained" disabled={loading}>
						{loading && <CircularProgress size={24} />}
						{!loading && client?.name ? "Update Client" : "Create Client"}
					</Button>
				</div>
			</form>
		</Box>
	);
}
