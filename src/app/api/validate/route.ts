import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { id } = await req.json();

		// Check MAP_DATA
		const mapData = (await import("@/data/data")).MAP_DATA;
		const mapPointExists = mapData.some(point => point.id === id);

		// Check ProjectsData
		const projectsData = (await import("@/data/ProjectsData")).ProjectsData;
		const projectExists = projectsData.features.some(feature => feature.properties.id === id);

		if (mapPointExists || projectExists) {
			return NextResponse.json({ exists: true }, { status: 200 });
		}

		return NextResponse.json({ exists: false }, { status: 200 });
	} catch (error) {
		console.error("Error validating ID:", error);
		return NextResponse.json({ message: "Error validating ID" }, { status: 500 });
	}
}
