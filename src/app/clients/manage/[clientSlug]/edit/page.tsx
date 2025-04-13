"use client";
import ClientForm from "@/components/Client/ClientForm";
import { Client } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewClientPage() {
	const params = useParams();
	const [client, setClient] = useState<Client | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchClient();
	}, []);

	const fetchClient = async () => {
		try {
			const response = await fetch(`/api/clients/${params.clientSlug}`);
			if (!response.ok) throw new Error("Failed to fetch client data");

			const data = await response.json();
			setClient(data);
		} catch (error) {
			console.error("Error fetching client:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}
	return <ClientForm client={client} />;
}
