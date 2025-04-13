import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET() {
	try {
		const data = (await import("@/data/data")).MAP_DATA;
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error("Error reading map points:", error);
		return NextResponse.json({ message: "Error reading map points" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const dataPath = path.join(process.cwd(), "data", "data.ts");
		const currentData = (await import("@/data/data")).MAP_DATA;

		// Add new point
		const newPoint = await req.json();
		currentData.push(newPoint);

		// Write updated data
		const fileContent = `export const MAP_DATA = ${JSON.stringify(currentData, null, 2)};\n`;
		await fs.writeFile(dataPath, fileContent, "utf8");

		return NextResponse.json({ message: "Map point added successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error saving map point:", error);
		return NextResponse.json({ message: "Error saving map point" }, { status: 500 });
	}
}
