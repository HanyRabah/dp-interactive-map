// app/api/pois/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get("type");
		const bounds = searchParams.get("bounds");

		let whereClause: any = {};

		if (type) {
			whereClause = {
				...whereClause,
				type: {
					name: type,
				},
			};
		}

		if (bounds) {
			const [swLng, swLat, neLng, neLat] = bounds.split(",").map(Number);
			whereClause = {
				...whereClause,
				lat: { gte: swLat, lte: neLat },
				lng: { gte: swLng, lte: neLng },
			};
		}

		const pois = await prisma.pOI.findMany({
			where: whereClause,
			include: {
				type: true,
			},
		});

		return NextResponse.json(pois);
	} catch (error) {
		console.error("Error fetching POIs:", error);
		return NextResponse.json({ error: "Failed to fetch POIs" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { title, lat, lng, type } = body;

		if (!title || !lat || !lng || !type) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const poi = await prisma.pOI.create({
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

		return NextResponse.json(poi, { status: 201 });
	} catch (error) {
		console.error("Error creating POI:", error);
		return NextResponse.json({ error: "Failed to create POI" }, { status: 500 });
	}
}
