// app/api/projects/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const body = await req.json();
	const { clientId, name, description, lat, lng, zoom, hideMarker, isVisible, polygon: polygonData } = body;

	console.log("Creating project with client ID:", clientId);

	if (!req.body) {
		return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
	}

	if (!clientId) {
		return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
	}

	try {
		// First, check if the client exists
		const clientExists = await prisma.client.findUnique({
			where: {
				id: clientId,
			},
		});

		if (!clientExists) {
			// Try finding by slug if ID doesn't work
			const clientBySlug = await prisma.client.findUnique({
				where: {
					slug: clientId,
				},
			});

			if (!clientBySlug) {
				return NextResponse.json(
					{
						error: `Client not found with ID or slug: ${clientId}`,
					},
					{ status: 404 }
				);
			}
		}

		// Create the project
		const projectCreateData = {
			name,
			description: description || "",
			lat: parseFloat(lat),
			lng: parseFloat(lng),
			zoom: parseInt(zoom),
			hideMarker: hideMarker || false,
			isVisible: isVisible !== undefined ? isVisible : true,
			client: {
				connect: clientExists ? { id: clientId } : { slug: clientId },
			},
		};

		// Create project first
		const project = await prisma.project.create({
			data: projectCreateData,
			include: {
				client: true,
			},
		});

		// If we have polygon data, create it separately after project creation
		if (polygonData) {
			const polygonCreateData = {
				id: polygonData.id,
				name: polygonData.name,
				type: polygonData.type,
				coordinates: polygonData.coordinates,
				description: polygonData.description || "",
				project: {
					connect: {
						id: project.id,
					},
				},
			};

			// Create polygon with style and popup details
			if (polygonData.style) {
				await prisma.projectPolygon.create({
					data: {
						...polygonCreateData,
						style: {
							create: {
								fillColor: polygonData.style.fillColor,
								hoverFillColor: polygonData.style.hoverFillColor,
								fillOpacity: polygonData.style.fillOpacity,
								hoverFillOpacity: polygonData.style.hoverFillOpacity,
								lineColor: polygonData.style.lineColor,
								lineWidth: polygonData.style.lineWidth || 1,
								lineOpacity: polygonData.style.lineOpacity || 1,
								lineDashArray: Array.isArray(polygonData.style.lineDashArray)
									? JSON.stringify(polygonData.style.lineDashArray)
									: polygonData.style.lineDashArray,
							},
						},
						popupDetails: polygonData.popupDetails
							? {
									create: {
										title: polygonData.popupDetails.title || "",
										image: polygonData.popupDetails.image || "",
										description: polygonData.popupDetails.description || "",
										ariealLink: polygonData.popupDetails.ariealLink || "",
										videoLink: polygonData.popupDetails.videoLink || "",
										imagesLink: polygonData.popupDetails.imagesLink || "",
										link: polygonData.popupDetails.link || "",
										type: polygonData.popupDetails.type || "details",
									},
							  }
							: undefined,
					},
				});
			}
		}

		// Get the full project with all relations
		const createdProject = await prisma.project.findUnique({
			where: {
				id: project.id,
			},
			include: {
				polygon: {
					include: {
						style: true,
						popupDetails: true,
					},
				},
			},
		});

		return NextResponse.json(
			{
				data: createdProject,
				message: "Project created successfully",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating project:", error);
		return NextResponse.json(
			{
				error: "Failed to create project",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		const projects = await prisma.project.findMany({
			include: {
				details: true,
				polygon: {
					include: {
						style: true,
						popupDetails: true,
					},
				},
			},
		});

		return NextResponse.json({ data: projects }, { status: 200 });
	} catch (error) {
		console.error("Error fetching projects:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch projects",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
