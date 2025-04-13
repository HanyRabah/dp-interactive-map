import formidable from "formidable";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

type Params = Promise<{ clientNamePath: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
	const { clientNamePath } = await params; // Access dynamic segment from params
	const uploadDir = path.join(process.cwd(), "public", "clients", clientNamePath);

	// Ensure directory exists
	await fs.promises.mkdir(uploadDir, { recursive: true });

	const form = formidable({
		uploadDir,
		keepExtensions: true,
		maxFileSize: 100 * 1024 * 1024, // 100MB limit
	});

	try {
		const formData = await request.formData(); // Parse FormData
		const file = formData.get("logo") as File; // Use the correct key ("logo")

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		// Save the file to the upload directory
		const filePath = path.join(uploadDir, file.name);
		const buffer = Buffer.from(await file.arrayBuffer());
		await fs.promises.writeFile(filePath, buffer);

		return NextResponse.json({ filename: file.name }, { status: 200 });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
