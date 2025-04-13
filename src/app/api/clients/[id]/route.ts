// app/api/clients/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
	try {
		const { id: identifier } = await params;

		// Try to find client by id first
		let client = await prisma.client.findUnique({
			where: { id: identifier },
			include: {
				projects: {
					include: {
						polygon: {
							include: {
								popupDetails: true,
								style: true,
							},
						},
					},
				},
			},
		});

		// If not found by id, try by slug
		if (!client) {
			client = await prisma.client.findUnique({
				where: { slug: identifier },
				include: {
					projects: {
						include: {
							polygon: {
								include: {
									popupDetails: true,
									style: true,
								},
							},
						},
					},
				},
			});
		}

		if (!client) {
			return NextResponse.json({ error: "Client not found" }, { status: 404 });
		}

		return NextResponse.json(client);
	} catch (error) {
		console.error("Error fetching client:", error);
		return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
	}
}

export async function PUT(req: Request, { params }: { params: Params }) {
	try {
		const body = await req.json();
		const { id: identifier } = await params;
		const { name, logo, slug, lat, lng, isDefault } = body;

		// Find the client first to determine if it exists by ID or slug
		let client = await prisma.client.findUnique({ where: { id: identifier } });

		// If not found by ID, try slug
		if (!client) {
			client = await prisma.client.findUnique({ where: { slug: identifier } });
		}

		if (!client) {
			return NextResponse.json({ error: "Client not found" }, { status: 404 });
		}

		// Update the client using the found ID
		const updatedClient = await prisma.client.update({
			where: { id: client.id },
			data: {
				name,
				slug,
				lat: typeof lat === "string" ? JSON.parse(lat) : lat,
				lng: typeof lng === "string" ? JSON.parse(lng) : lng,
				logo,
				isDefault,
			},
		});

		return NextResponse.json(updatedClient);
	} catch (error) {
		console.error("Error updating client:", error);
		return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: Params }) {
	try {
		const { id: identifier } = await params;

		// Find the client first to determine if it exists by ID or slug
		let client = await prisma.client.findUnique({ where: { id: identifier } });

		// If not found by ID, try slug
		if (!client) {
			client = await prisma.client.findUnique({ where: { slug: identifier } });
		}

		if (!client) {
			return NextResponse.json({ error: "Client not found" }, { status: 404 });
		}

		// Delete using the found ID
		await prisma.client.delete({
			where: { id: client.id },
		});

		return NextResponse.json({ message: "Client deleted successfully" });
	} catch (error) {
		console.error("Error deleting client:", error);
		return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
	}
}
