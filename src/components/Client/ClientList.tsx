"use client";
import { Card, CardContent, Chip, CircularProgress, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Client } from "@prisma/client";
import { Edit2, MapPin, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface DeleteDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	clientName: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onClose, onConfirm, clientName }) => (
	<Dialog open={open} onClose={onClose}>
		<DialogTitle>Delete {clientName}?</DialogTitle>
		<DialogContent>
			<p className="text-gray-600">
				Are you sure you want to delete this client? This action cannot be undone and will remove all associated
				projects.
			</p>
			<div className="mt-4 flex justify-end gap-2">
				<button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
					Cancel
				</button>
				<button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded">
					Delete
				</button>
			</div>
		</DialogContent>
	</Dialog>
);

type ExtendedClient = Client & {
	projects: {
		id: string;
		name: string;
	}[];
};

const ClientList: React.FC = () => {
	const [clients, setClients] = useState<ExtendedClient[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);

	React.useEffect(() => {
		fetchClients();
	}, []);

	const fetchClients = async () => {
		try {
			const response = await fetch("/api/clients");
			const data = await response.json();
			setClients(data);
		} catch (error) {
			console.error("Error fetching clients:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (client: Client) => {
		setSelectedClient(client);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedClient) return;

		try {
			const response = await fetch(`/api/clients/${selectedClient.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setClients(prevClients => prevClients.filter(c => c.id !== selectedClient.id));
			}
		} catch (error) {
			console.error("Error deleting client:", error);
		} finally {
			setDeleteDialogOpen(false);
			setSelectedClient(null);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<CircularProgress />
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Clients</h1>
				<Link
					href="/clients/new"
					className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
					<Plus className="w-4 h-4" />
					Add Client
				</Link>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{clients.map(client => (
					<Card key={client.id} className="hover:shadow-lg transition-shadow">
						<CardContent className="p-6">
							<div className="flex justify-between items-start">
								<div>
									<h2 className="text-xl font-semibold mb-2">{client.name}</h2>
									<div className="flex items-center gap-2 text-gray-500">
										<MapPin className="w-4 h-4" />
										<span>{client.projects.length} Projects</span>
									</div>
									<div className="mt-2 h-5">
										{client.isDefault && <Chip label="Default Client" size="small" color="success" />}
									</div>
								</div>

								<div className="flex gap-2">
									<Link href={`/clients/edit/${client.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded">
										<Edit2 className="w-4 h-4" />
									</Link>
									<button onClick={() => handleDelete(client)} className="p-2 text-red-500 hover:bg-red-50 rounded">
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>

							<div className="mt-4 flex gap-2">
								<Link
									href={`/${client.slug}`}
									target="_blank"
									className="flex-1 text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
									View Map
								</Link>
								<Link
									href={`/projects/${client.id}`}
									className="flex-1 text-center px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded">
									Manage Projects
								</Link>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<DeleteDialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={confirmDelete}
				clientName={selectedClient?.name || ""}
			/>
		</div>
	);
};

export default ClientList;
