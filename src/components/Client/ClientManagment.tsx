import { CircularProgress, Switch } from "@mui/material";
import { Client } from "@prisma/client";
import { Edit2, Eye, EyeOff, MapPin, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Project {
	id: string;
	name: string;
	description?: string;
	lat: number;
	lng: number;
	isVisible: boolean;
	hideMarker: boolean;
	polygon?: any;
}

interface ClientProps extends Client {
	projects: Project[];
}

const ClientProjects = () => {
	const params = useParams();
	const [client, setClient] = useState<ClientProps | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	useEffect(() => {
		fetchClient();
	}, []);

	const fetchClient = async () => {
		try {
			const response = await fetch(`/api/clients/${params.clientId}`);
			if (!response.ok) throw new Error("Failed to fetch client data");

			const data = await response.json();
			setClient(data);
		} catch (error) {
			console.error("Error fetching client:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleVisibilityToggle = async (projectId: string, currentValue: boolean) => {
		try {
			const response = await fetch(`/api/projects/${projectId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					isVisible: !currentValue,
				}),
			});

			if (!response.ok) throw new Error("Failed to update project visibility");

			// Update local state
			setClient(prev => {
				if (!prev) return null;
				return {
					...prev,
					projects: prev.projects.map(p => (p.id === projectId ? { ...p, isVisible: !currentValue } : p)),
				};
			});
		} catch (error) {
			console.error("Error updating project visibility:", error);
		}
	};

	const handleDeleteProject = async (projectId: string) => {
		try {
			const response = await fetch(`/api/projects/${projectId}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete project");

			// Update local state
			setClient(prev => {
				if (!prev) return null;
				return {
					...prev,
					projects: prev.projects.filter(p => p.id !== projectId),
				};
			});
		} catch (error) {
			console.error("Error deleting project:", error);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<CircularProgress />
			</div>
		);
	}

	if (!client) {
		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-xl">Client not found</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold">{client.name}</h1>
					<p className="text-gray-600">Projects Management</p>
				</div>
				<div className="flex gap-4">
					<Link href={`/clients`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
						Back to Clients List
					</Link>
					<Link
						href={`/projects/${client.id}/new`}
						className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						<Plus className="w-4 h-4" />
						Add Project
					</Link>
				</div>
			</div>

			<div className="grid gap-6">
				{client.projects.map(project => (
					<div key={project.id} className="bg-white rounded-lg shadow p-6">
						<div className="flex justify-between items-start">
							<div>
								<h2 className="text-xl font-semibold mb-2">{project.name}</h2>
								{project.description && <p className="text-gray-600 mb-4">{project.description}</p>}
								<div className="flex items-center gap-4 text-sm text-gray-500">
									<div className="flex items-center gap-1">
										<MapPin className="w-4 h-4" />
										<span>
											{project.lat.toFixed(6)}, {project.lng.toFixed(6)}
										</span>
									</div>
									{project.polygon && (
										<div className="flex items-center gap-1">
											<span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Has Polygon</span>
										</div>
									)}
								</div>
							</div>

							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									{project.isVisible ? (
										<Eye className="w-4 h-4 text-green-500" />
									) : (
										<EyeOff className="w-4 h-4 text-gray-400" />
									)}
									<Switch
										checked={project.isVisible}
										onChange={() => handleVisibilityToggle(project.id, project.isVisible)}
										color="primary"
									/>
								</div>
								<Link
									href={`/projects/${client.id}/edit/${project.id}`}
									className="p-2 text-blue-500 hover:bg-blue-50 rounded">
									<Edit2 className="w-4 h-4" />
								</Link>
								<button
									onClick={() => handleDeleteProject(project.id)}
									className="p-2 text-red-500 hover:bg-red-50 rounded">
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				))}

				{client.projects.length === 0 && (
					<div className="text-center py-12 bg-gray-50 rounded-lg">
						<p className="text-gray-600">No projects yet</p>
						<Link
							href={`/projects/new/${client.id}/`}
							className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
							<Plus className="w-4 h-4" />
							Add Your First Project
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default ClientProjects;
