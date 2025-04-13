// app/api/project-polygon/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Updates an existing polygon
 */
export async function PUT(req: NextRequest) {
	const body = await req.json();

	const { id, name, description, type, coordinates, style, popupDetails, projectId } = body;

	try {
		// Validate required fields
		if (!name || !type || !coordinates) {
			return NextResponse.json({ error: "Missing required fields: name, type, or coordinates" }, { status: 400 });
		}

		// Handle line dash array formatting if it's an array
		const formattedLineDashArray = Array.isArray(style?.lineDashArray)
			? JSON.stringify(style.lineDashArray)
			: style?.lineDashArray;

		// Check if this is a new polygon for an existing project
		const updateData: any = {
			name,
			description: description || "",
			type,
			coordinates,
		};

		// If projectId is provided and needs to be connected
		if (projectId) {
			updateData.project = {
				connect: { id: projectId },
			};
		}

		// Update the polygon with nested relations
		const updatedPolygon = await prisma.projectPolygon.update({
			where: { id },
			data: {
				...updateData,
				// Handle style upsert
				style: {
					upsert: {
						create: {
							fillColor: style?.fillColor || "#000000",
							hoverFillColor: style?.hoverFillColor || "#333333",
							fillOpacity: style?.fillOpacity || 0.5,
							hoverFillOpacity: style?.hoverFillOpacity || 0.7,
							lineColor: style?.lineColor || "#3B82F6",
							lineWidth: style?.lineWidth || 2,
							lineOpacity: style?.lineOpacity || 1,
							lineDashArray: formattedLineDashArray || JSON.stringify([2, 2]),
						},
						update: {
							fillColor: style?.fillColor,
							hoverFillColor: style?.hoverFillColor,
							fillOpacity: style?.fillOpacity,
							hoverFillOpacity: style?.hoverFillOpacity,
							lineColor: style?.lineColor,
							lineWidth: style?.lineWidth,
							lineOpacity: style?.lineOpacity,
							lineDashArray: formattedLineDashArray,
						},
					},
				},
				// Handle popup details upsert
				popupDetails: {
					upsert: {
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
						update: {
							title: popupDetails?.title,
							image: popupDetails?.image,
							description: popupDetails?.description,
							link: popupDetails?.link,
							imagesLink: popupDetails?.imagesLink,
							videoLink: popupDetails?.videoLink,
							ariealLink: popupDetails?.ariealLink,
							type: popupDetails?.type,
						},
					},
				},
			},
			include: {
				style: true,
				popupDetails: true,
			},
		});

		return NextResponse.json({ data: updatedPolygon, message: "Polygon updated successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error updating polygon:", error);
		return NextResponse.json({ error: "Failed to update polygon", details: error }, { status: 500 });
	}
}

/**
 * Deletes a polygon
 */
type Params = Promise<{ id: string }>;
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
	const { id } = await params;

	try {
		// First, find the polygon to check if it exists
		const polygon = await prisma.projectPolygon.findUnique({
			where: { id },
			include: {
				style: true,
				popupDetails: true,
			},
		});

		if (!polygon) {
			return NextResponse.json({ error: "Polygon not found" }, { status: 404 });
		}

		// Delete the polygon and all related records (cascade via Prisma schema)
		const deletedPolygon = await prisma.projectPolygon.delete({
			where: { id },
		});

		return NextResponse.json({ data: deletedPolygon, message: "Polygon deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting polygon:", error);
		return NextResponse.json({ error: "Failed to delete polygon", details: error }, { status: 500 });
	}
}
