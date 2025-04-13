// components/DrawPolygon/PolygonForm/index.tsx
import { Polygon } from "@/types/projects";
import { Button, FormControl, FormLabel, Radio, RadioGroup, Slider } from "@mui/material";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Edit as EditIcon } from "lucide-react";
import React, { useState } from "react";

interface PolygonFormProps {
	polygon: Polygon;
	handleFormDataUpdates: (polygonId: string, updates: Partial<Polygon>) => void;
	EditPolygonPoints: (polygonId: string) => void;
	isEditing?: boolean;
}

interface TabPanelProps {
	children?: React.ReactNode;
	value: number;
	index: number;
}

/**
 * Uploads a video file to the server
 */
const uploadVideo = async (file: File, projectName: string) => {
	const formData = new FormData();
	formData.append("video", file);

	const projectNamePath = projectName.replace(/\s+/g, "-").toLowerCase();

	try {
		const response = await fetch(`/api/upload/video/${projectNamePath}`, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) throw new Error("Upload failed");

		const data = await response.json();
		return `/projects/${projectNamePath}/${data.filename}`;
	} catch (error) {
		console.error("Error uploading video:", error);
		throw error;
	}
};

/**
 * Tab Panel Component
 */
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`polygon-tabpanel-${index}`}
			aria-labelledby={`polygon-tab-${index}`}>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
};

/**
 * PolygonForm Component for editing polygon properties
 */
const PolygonForm: React.FC<PolygonFormProps> = ({ polygon, handleFormDataUpdates, EditPolygonPoints, isEditing }) => {
	const [activeTab, setActiveTab] = useState(0);
	const [uploading, setUploading] = useState(false);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	/**
	 * Updates polygon style properties
	 */
	const updatePolygonStyles = (updatedStyle: Partial<Polygon["style"]>) => {
		handleFormDataUpdates(polygon.id, {
			style: {
				...polygon.style,
				...updatedStyle,
			},
		});
	};

	/**
	 * Handles file upload for videos
	 */
	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		try {
			const videoUrl = await uploadVideo(file, polygon.name);
			handleFormDataUpdates(polygon.id, {
				popupDetails: { ...polygon.popupDetails, videoLink: videoUrl, type: polygon.popupDetails?.type || "details" },
			});
		} catch (error) {
			console.error("Upload failed:", error);
		} finally {
			setUploading(false);
		}
	};

	/**
	 * Format coordinates for display
	 */
	const formatCoordinates = (coordinates: string) => {
		try {
			return JSON.parse(coordinates).map((coord: number[]) => {
				return coord.map((point: number) => {
					return point.toFixed(6);
				});
			});
		} catch (e) {
			console.error("Error formatting coordinates:", e);
			return [];
		}
	};

	const formattedCoordinates = formatCoordinates(polygon.coordinates);
	const formattedCoordinatesString = JSON.stringify(formattedCoordinates, null, 2);

	return (
		<Box sx={{ width: "100%", mt: 2 }}>
			{/* Tab Navigation */}
			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<Tabs value={activeTab} onChange={handleTabChange} aria-label="polygon form tabs">
					<Tab label="Basic Info" id="polygon-tab-0" aria-controls="polygon-tabpanel-0" />
					<Tab label="Style" id="polygon-tab-1" aria-controls="polygon-tabpanel-1" />
					<Tab label="Popup" id="polygon-tab-2" aria-controls="polygon-tabpanel-2" />
					<Tab label="Coordinates" id="polygon-tab-3" aria-controls="polygon-tabpanel-3" />
				</Tabs>
			</Box>

			{/* Basic Info Tab */}
			<TabPanel value={activeTab} index={0}>
				<Grid container spacing={2}>
					<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						<TextField
							fullWidth
							label="Name"
							value={polygon.name}
							onChange={e => handleFormDataUpdates(polygon.id, { name: e.target.value })}
							required
						/>
					</Grid>
					<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						<TextField
							fullWidth
							multiline
							rows={3}
							label="Description"
							value={polygon.description || ""}
							onChange={e => handleFormDataUpdates(polygon.id, { description: e.target.value })}
						/>
					</Grid>
				</Grid>
			</TabPanel>

			{/* Style Tab */}
			<TabPanel value={activeTab} index={1}>
				<Grid container spacing={2}>
					{polygon.type === ("Polygon" as unknown as any) && (
						<>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<TextField
									fullWidth
									label="Fill Color"
									type="color"
									value={polygon.style?.fillColor || "#000000"}
									onChange={e => {
										updatePolygonStyles({ fillColor: e.target.value });
									}}
									slotProps={{ input: { sx: { height: "40px" } } }}
								/>
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<TextField
									fullWidth
									label="Hover Fill Color"
									type="color"
									value={polygon.style?.hoverFillColor || "#333333"}
									onChange={e => updatePolygonStyles({ hoverFillColor: e.target.value })}
									slotProps={{ input: { sx: { height: "40px" } } }}
								/>
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<Typography gutterBottom>Fill Opacity</Typography>
								<Slider
									value={polygon.style?.fillOpacity || 0.5}
									onChange={(_, value) => updatePolygonStyles({ fillOpacity: value as number })}
									step={0.1}
									marks
									min={0}
									max={1}
								/>
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<Typography gutterBottom>Hover Fill Opacity</Typography>
								<Slider
									value={polygon.style?.hoverFillOpacity || 0.7}
									onChange={(_, value) => updatePolygonStyles({ hoverFillOpacity: value as number })}
									step={0.1}
									marks
									min={0}
									max={1}
								/>
							</Grid>
						</>
					)}
					<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						<TextField
							fullWidth
							label="Line Color"
							type="color"
							value={polygon.style?.lineColor || "#000000"}
							onChange={e => updatePolygonStyles({ lineColor: e.target.value })}
							slotProps={{ input: { sx: { height: "40px" } } }}
						/>
					</Grid>
					<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						<TextField
							fullWidth
							type="number"
							label="Line Width"
							value={polygon.style?.lineWidth || 1}
							onChange={e => updatePolygonStyles({ lineWidth: parseInt(e.target.value) })}
						/>
					</Grid>
				</Grid>
			</TabPanel>

			{/* Popup Tab */}
			<TabPanel value={activeTab} index={2}>
				<Grid container spacing={2}>
					<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						<FormControl component="fieldset">
							<FormLabel component="legend">Popup Type</FormLabel>
							<RadioGroup
								row
								value={polygon.popupDetails?.type || "details"}
								onChange={e =>
									handleFormDataUpdates(polygon.id, {
										popupDetails: {
											...polygon.popupDetails,
											type: e.target.value as "link" | "details",
										},
									})
								}>
								<FormControlLabel value="link" control={<Radio />} label="Simple Link" />
								<FormControlLabel value="details" control={<Radio />} label="Detailed Info" />
							</RadioGroup>
						</FormControl>
					</Grid>

					{polygon.popupDetails?.type === "link" ? (
						<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
							<TextField
								fullWidth
								label="Link URL"
								value={polygon.popupDetails?.link || ""}
								onChange={e =>
									handleFormDataUpdates(polygon.id, {
										popupDetails: {
											...polygon.popupDetails,
											link: e.target.value,
											type: polygon.popupDetails?.type || "details",
										},
									})
								}
							/>
						</Grid>
					) : (
						<>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<TextField
									fullWidth
									label="Popup Title"
									value={polygon.popupDetails?.title || ""}
									onChange={e =>
										handleFormDataUpdates(polygon.id, {
											popupDetails: {
												...polygon.popupDetails,
												title: e.target.value,
												type: polygon.popupDetails?.type || "details",
											},
										})
									}
								/>
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<TextField
									fullWidth
									label="Image URL"
									value={polygon.popupDetails?.image || ""}
									onChange={e =>
										handleFormDataUpdates(polygon.id, {
											popupDetails: {
												...polygon.popupDetails,
												image: e.target.value,
												type: polygon.popupDetails?.type || "details",
											},
										})
									}
								/>
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<TextField
									fullWidth
									multiline
									rows={3}
									label="Popup Description"
									value={polygon.popupDetails?.description || ""}
									onChange={e =>
										handleFormDataUpdates(polygon.id, {
											popupDetails: {
												...polygon.popupDetails,
												description: e.target.value,
												type: polygon.popupDetails?.type || "details",
											},
										})
									}
								/>
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<TextField
									fullWidth
									label="360 View Link"
									value={polygon.popupDetails?.ariealLink || ""}
									onChange={e =>
										handleFormDataUpdates(polygon.id, {
											popupDetails: {
												...polygon.popupDetails,
												ariealLink: e.target.value,
												type: polygon.popupDetails?.type || "details",
											},
										})
									}
								/>
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<input
									type="file"
									accept="video/*"
									onChange={handleFileChange}
									style={{ display: "none" }}
									id="video-upload"
								/>
								<label htmlFor="video-upload">
									<Button component="span" variant="outlined" disabled={uploading} fullWidth>
										{uploading ? "Uploading..." : "Upload Video"}
									</Button>
								</label>
								{polygon.popupDetails?.videoLink && (
									<Typography variant="caption" display="block" mt={1}>
										Current video: {polygon.popupDetails.videoLink}
									</Typography>
								)}
							</Grid>
							<Grid sx={{ display: "flex", width: "100%", alignItems: "center" }}>
								<TextField
									fullWidth
									label="Images Link"
									value={polygon.popupDetails?.imagesLink || ""}
									onChange={e =>
										handleFormDataUpdates(polygon.id, {
											popupDetails: {
												...polygon.popupDetails,
												imagesLink: e.target.value,
												type: polygon.popupDetails?.type || "details",
											},
										})
									}
								/>
							</Grid>
						</>
					)}
				</Grid>
			</TabPanel>

			{/* Coordinates Tab */}
			<TabPanel value={activeTab} index={3}>
				<Grid container spacing={2}>
					<Grid sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Typography mr={2} variant="subtitle1">
							Edit Coordinates
						</Typography>
						<Button
							variant="outlined"
							startIcon={<EditIcon />}
							onClick={() => EditPolygonPoints(polygon.id)}
							disabled={isEditing}
							color={isEditing ? "secondary" : "primary"}>
							{isEditing ? "Currently Editing" : "Edit on Map"}
						</Button>
					</Grid>
					<Grid>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
							{isEditing
								? "Click and drag points on the map to edit the polygon shape. Click 'Finish Editing' when done."
								: "Click 'Edit on Map' to modify the polygon shape directly on the map."}
						</Typography>
						<Box
							sx={{
								backgroundColor: "grey.100",
								p: 2,
								borderRadius: 1,
								maxHeight: "400px",
								overflow: "auto",
							}}>
							<pre style={{ margin: 0, fontSize: "0.875rem" }}>{formattedCoordinatesString}</pre>
						</Box>
					</Grid>
				</Grid>
			</TabPanel>
		</Box>
	);
};
export default PolygonForm;
