// api/projects/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
	const body = await req.json();
	const { id: projectId, name, description, lat, lng, zoom, hideMarker, isVisible, polygon } = body;

	try {
		// Prepare the update data without polygon initially
		const updateData: {
			name: any;
			description: any;
			lat: any;
			lng: any;
			zoom: any;
			hideMarker: any;
			isVisible: any;
			polygon?: any; // Add polygon as an optional property
		} = {
			name,
			description,
			lat,
			lng,
			zoom,
			hideMarker,
			isVisible,
		};

		// Only include polygon upsert if polygon data exists
		if (polygon) {
			updateData.polygon = {
				upsert: {
					create: {
						id: polygon.id,
						name: polygon.name,
						type: polygon.type,
						coordinates: polygon.coordinates,
						style: {
							create: {
								fillColor: polygon.style?.fillColor,
								hoverFillColor: polygon.style?.hoverFillColor,
								fillOpacity: polygon.style?.fillOpacity,
								hoverFillOpacity: polygon.style?.hoverFillOpacity,
								lineColor: polygon.style?.lineColor,
								lineWidth: polygon.style?.lineWidth,
								lineOpacity: polygon.style?.lineOpacity,
								lineDashArray: polygon.style?.lineDashArray,
							},
						},
						popupDetails: {
							create: {
								title: polygon.popupDetails?.title,
								image: polygon.popupDetails?.image,
								description: polygon.popupDetails?.description,
								link: polygon.popupDetails?.link,
								imagesLink: polygon.popupDetails?.imagesLink,
								videoLink: polygon.popupDetails?.videoLink,
								ariealLink: polygon.popupDetails?.ariealLink,
								type: polygon.popupDetails?.type,
							},
						},
					},
					update: {
						name: polygon.name,
						type: polygon.type,
						coordinates: polygon.coordinates,
						style: {
							update: {
								fillColor: polygon.style?.fillColor,
								hoverFillColor: polygon.style?.hoverFillColor,
								fillOpacity: polygon.style?.fillOpacity,
								hoverFillOpacity: polygon.style?.hoverFillOpacity,
								lineColor: polygon.style?.lineColor,
								lineWidth: polygon.style?.lineWidth,
								lineOpacity: polygon.style?.lineOpacity,
								lineDashArray: polygon.style?.lineDashArray,
							},
						},
						popupDetails: {
							update: {
								title: polygon.popupDetails?.title,
								image: polygon.popupDetails?.image,
								description: polygon.popupDetails?.description,
								link: polygon.popupDetails?.link,
								imagesLink: polygon.popupDetails?.imagesLink,
								videoLink: polygon.popupDetails?.videoLink,
								ariealLink: polygon.popupDetails?.ariealLink,
								type: polygon.popupDetails?.type,
							},
						},
					},
				},
			};
		}

		const updatedProject = await prisma.project.update({
			where: { id: projectId },
			data: updateData,
			include: {
				polygon: {
					include: {
						style: true,
						popupDetails: true,
					},
				},
			},
		});

		return NextResponse.json({ data: updatedProject, message: "Project updated" }, { status: 200 });
	} catch (error) {
		console.error("Error updating project:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
	}
}

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
	try {
		const { id } = await params;
		const client = await prisma.project.findUnique({
			where: { id },
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

		if (!client) {
			return NextResponse.json({ error: "Client not found" }, { status: 404 });
		}

		return NextResponse.json(client);
	} catch (error) {
		console.error("Error fetching client:", error);
		return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: Params }) {
	const { id } = await params;
	try {
		await prisma.project.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Client deleted successfully" });
	} catch (error) {
		console.error("Error deleting client:", error);
		return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
	}
}
