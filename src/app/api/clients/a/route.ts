import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type TParams = Promise<{ slug: string }>;

export async function GET(req: Request, { params }: { params: TParams }) {
	try {
		const { slug } = await params;
		const client = await prisma.client.findUnique({
			where: { slug },
			include: {
				projects: {
					where: {
						isVisible: true,
					},
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

		if (!client) {
			return NextResponse.json({ error: "Client not found" }, { status: 404 });
		}

		return NextResponse.json(client);
	} catch (error) {
		console.error("Error fetching client:", error);
		return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
	}
}

export async function PUT(req: Request, { params }: { params: TParams }) {
	const { slug } = await params;
	try {
		const body = await req.json();
		const { name, slug, logo } = body;

		const client = await prisma.client.update({
			where: { slug },
			data: {
				name,
				slug,
				logo,
			},
		});

		return NextResponse.json(client);
	} catch (error) {
		console.error("Error updating client:", error);
		return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: TParams }) {
	const { slug } = await params;
	try {
		await prisma.client.delete({
			where: { slug },
		});

		return NextResponse.json({ message: "Client deleted successfully" });
	} catch (error) {
		console.error("Error deleting client:", error);
		return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
	}
}
