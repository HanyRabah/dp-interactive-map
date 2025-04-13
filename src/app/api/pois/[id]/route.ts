// app/api/pois/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json({ error: "Invalid POI ID" }, { status: 400 });
		}

		const poi = await prisma.pOI.findUnique({
			where: { id },
			include: {
				type: true,
			},
		});

		if (!poi) {
			return NextResponse.json({ error: "POI not found" }, { status: 404 });
		}

		return NextResponse.json(poi);
	} catch (error) {
		console.error("Error fetching POI:", error);
		return NextResponse.json({ error: "Failed to fetch POI" }, { status: 500 });
	}
}

export async function PUT(request: Request, { params }: { params: Params }) {
	try {
		const { id } = await params;
		const body = await request.json();
		const { title, lat, lng, type } = body;

		if (!id) {
			return NextResponse.json({ error: "Invalid POI ID" }, { status: 400 });
		}

		const poi = await prisma.pOI.update({
			where: { id },
			data: {
				title,
				lat,
				lng,
				type: {
					connect: {
						name: type,
					},
				},
			},
			include: {
				type: true,
			},
		});

		return NextResponse.json(poi);
	} catch (error) {
		console.error("Error updating POI:", error);
		return NextResponse.json({ error: "Failed to update POI" }, { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: { params: Params }) {
	try {
		const { id } = await params;

		if (!id) {
			return NextResponse.json({ error: "Invalid POI ID" }, { status: 400 });
		}

		await prisma.pOI.delete({
			where: { id },
		});

		return NextResponse.json({ message: "POI deleted successfully" });
	} catch (error) {
		console.error("Error deleting POI:", error);
		return NextResponse.json({ error: "Failed to delete POI" }, { status: 500 });
	}
}
