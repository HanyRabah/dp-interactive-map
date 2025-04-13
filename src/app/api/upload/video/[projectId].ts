// pages/api/upload/video/[projectId].ts
import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
	const projectId = req.query.projectId as string;
	const uploadDir = path.join(process.cwd(), "public", "projects", projectId);

	// Ensure directory exists
	await fs.promises.mkdir(uploadDir, { recursive: true });

	const form = formidable({
		uploadDir,
		keepExtensions: true,
		maxFileSize: 100 * 1024 * 1024, // 100MB limit
	});

	try {
		const [fields, files] = await form.parse(req);
		const file = files.video?.[0];

		if (!file) {
			return res.status(400).json({ error: "No video file uploaded" });
		}

		const filename = file.newFilename;

		return res.status(200).json({ filename });
	} catch (error) {
		console.error("Upload error:", error);
		return res.status(500).json({ error: "Upload failed" });
	}
}
