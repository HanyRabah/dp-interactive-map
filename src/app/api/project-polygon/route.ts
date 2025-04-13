// app/api/project-polygon/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Creates a new polygon
 */
export async function POST(req: Request) {
	const body = await req.json();
	const { projectId, id, name, description, type, coordinates, style, popupDetails } = body;

	try {
		// Validate required fields
		if (!projectId) {
			return NextResponse.json({ error: "Missing required field: projectId" }, { status: 400 });
		}

		// Log the received data for debugging
		console.log("Creating polygon with data:", {
			projectId,
			id,
			name,
			type,
			coordinates,
			style: style ? "Present" : "Missing",
			popupDetails: popupDetails ? "Present" : "Missing",
		});

		// Verify project exists
		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project) {
			return NextResponse.json({ error: `Project not found with ID: ${projectId}` }, { status: 404 });
		}

		// Format line dash array if present
		const formattedLineDashArray = Array.isArray(style?.lineDashArray)
			? JSON.stringify(style.lineDashArray)
			: style?.lineDashArray || JSON.stringify([2, 2]);

		// Create new polygon with nested records
		const createData: {
			id?: string;
			name: any;
			description: any;
			type: any;
			coordinates: any;
			project: { connect: { id: any } };
			style: {
				create: {
					fillColor: any;
					hoverFillColor: any;
					fillOpacity: any;
					hoverFillOpacity: any;
					lineColor: any;
					lineWidth: any;
					lineOpacity: any;
					lineDashArray: any;
				};
			};
			popupDetails: {
				create: {
					title: any;
					image: any;
					description: any;
					link: any;
					imagesLink: any;
					videoLink: any;
					ariealLink: any;
					type: any;
				};
			};
		} = {
			name: name || `Polygon ${new Date().toISOString()}`,
			description: description || "",
			type: type || "Polygon",
			coordinates: coordinates || "[]",
			project: {
				connect: { id: projectId },
			},
			// Create style record
			style: {
				create: {
					fillColor: style?.fillColor || "#d32f2f",
					hoverFillColor: style?.hoverFillColor || "#ff6659",
					fillOpacity: style?.fillOpacity || 0.5,
					hoverFillOpacity: style?.hoverFillOpacity || 0.7,
					lineColor: style?.lineColor || "#3B82F6",
					lineWidth: style?.lineWidth || 2,
					lineOpacity: style?.lineOpacity || 1,
					lineDashArray: formattedLineDashArray,
				},
			},
			// Create popup details record
			popupDetails: {
				create: {
					title: popupDetails?.title || "",
					image: popupDetails?.image || "",
					description: popupDetails?.description || "",
					link: popupDetails?.link || "",
					imagesLink: popupDetails?.imagesLink || "",
					videoLink: popupDetails?.videoLink || "",
					ariealLink: popupDetails?.ariealLink || "",
					type: popupDetails?.type || "details",
				},
			},
		};

		// If a specific ID is provided, use it
		if (id) {
			createData.id = id;
		}

		const newPolygon = await prisma.projectPolygon.create({
			data: createData,
			include: {
				style: true,
				popupDetails: true,
			},
		});

		console.log("Created polygon:", newPolygon.id);
		return NextResponse.json({ data: newPolygon, message: "Polygon created successfully" }, { status: 201 });
	} catch (error) {
		console.error("Error creating polygon:", error);
		return NextResponse.json({ error: "Failed to create polygon", details: error }, { status: 500 });
	}
}

/**
 * Gets all polygons for a project
 */
export async function GET(req: Request) {
	const url = new URL(req.url);
	const projectId = url.searchParams.get("projectId");

	if (!projectId) {
		return NextResponse.json({ error: "Missing required query parameter: projectId" }, { status: 400 });
	}

	try {
		const polygons = await prisma.projectPolygon.findMany({
			where: { projectId },
			include: {
				style: true,
				popupDetails: true,
			},
		});

		return NextResponse.json({ data: polygons }, { status: 200 });
	} catch (error) {
		console.error("Error fetching polygons:", error);
		return NextResponse.json({ error: "Failed to fetch polygons", details: error }, { status: 500 });
	}
}
