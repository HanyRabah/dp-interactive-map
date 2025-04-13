"use client";

import { useRouter } from "next/navigation"; // Note the import from next/navigation
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter(); // This is now using the App Router version
	const [loading, setLoading] = useState(true);

	const fetchClient = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/clients");
			if (!response.ok) throw new Error("Failed to fetch clients");

			const data = await response.json();
			// get isDefault client
			const defaultClient = data.find((client: any) => client.isDefault);
			if (defaultClient) {
				router.push(`/${defaultClient.slug}`);
			} else {
				console.error("No default client found");
				setLoading(false);
			}
		} catch (error) {
			console.error("Error fetching clients:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchClient();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	// Your actual render code will go here
	return <div>Content will go here</div>;
}
