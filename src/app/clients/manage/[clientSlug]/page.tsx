// app/clients/[clientId]/page.tsx
"use client";
import { Box, CircularProgress } from "@mui/material";
import { Client } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientDetailsPage() {
	const params = useParams();
	const [client, setClient] = useState<Client | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchClient = async () => {
			try {
				const response = await fetch(`/api/clients/${params.clientId}`);
				if (!response.ok) throw new Error("Failed to fetch client");

				const data = await response.json();
				setClient(data);
			} catch (error) {
				console.error("Error fetching client:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchClient();
	}, [params.clientId]);

	if (loading) {
		return (
			<Box className="flex justify-center items-center h-screen">
				<CircularProgress />
			</Box>
		);
	}

	if (!client) {
		return (
			<Box className="flex justify-center items-center h-screen">
				<p className="text-xl">Client not found</p>
			</Box>
		);
	}

	return (
		<Box className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">{client.name}</h1>
			{/* Add client details UI here */}
		</Box>
	);
}
