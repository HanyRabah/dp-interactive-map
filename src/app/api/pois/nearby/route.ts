// app/api/pois/nearby/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		// Get query parameters from the URL
		const { searchParams } = new URL(request.url);
		const latMin = searchParams.get("latMin");
		const latMax = searchParams.get("latMax");
		const lonMin = searchParams.get("lonMin");
		const lonMax = searchParams.get("lonMax");

		if (!latMin || !latMax || !lonMin || !lonMax) {
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
		}

		const pois = await prisma.pOI.findMany({
			where: {
				AND: [
					{ lat: { gte: parseFloat(latMin) } },
					{ lat: { lte: parseFloat(latMax) } },
					{ lng: { gte: parseFloat(lonMin) } },
					{ lng: { lte: parseFloat(lonMax) } },
				],
			},
			include: {
				type: true,
			},
		});

		return NextResponse.json(pois);
	} catch (error) {
		console.error("Error fetching nearby POIs:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
