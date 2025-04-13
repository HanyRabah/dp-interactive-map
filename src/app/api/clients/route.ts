// app/api/clients/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const clients = await prisma.client.findMany({
			include: {
				projects: {
					where: {
						isVisible: true,
					},
				},
			},
		});
		return NextResponse.json(clients);
	} catch (error) {
		console.error("Error fetching clients:", error);
		return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, slug, logo, lat, lng, isDefault } = body;

		const client = await prisma.client.create({
			data: {
				name,
				slug,
				logo,
				lat: parseFloat(lat),
				lng: parseFloat(lng),
				isDefault,
			},
		});

		return NextResponse.json(client);
	} catch (error) {
		console.error("Error creating client:", error);
		return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
	}
}
