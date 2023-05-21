import { FastifyInstance } from "fastify";
import {randomUUID} from "node:crypto";
import { createWriteStream } from "node:fs";
import {extname, resolve} from "node:path";
import {pipeline} from "node:stream";
import {promisify} from "node:util";

const pump = promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance){
	app.post("/upload", async (request, response) => {
		const upload = await request.file({
			limits: {
				fileSize: 5 * 1024 * 1024, // 5mb
			}
		});

		if(!upload){
			response.status(400);
			throw new Error("File is required");
		}
        
		const  mimeTypeRegex =  RegExp(/^(image|video)\/[a-zA-Z]/);
		const isMimeTypeFormatValid = mimeTypeRegex.test(upload.mimetype);

		if(!isMimeTypeFormatValid){
			response.status(400);
			throw new Error("File must be an image or video");
		}

		const fileId = randomUUID();
		const fileExtension = extname(upload.filename);
		const fileName = fileId.concat(fileExtension);

		const writeStream = createWriteStream(
			resolve(__dirname, "../../uploads", fileName)
		);

		await pump(upload.file, writeStream);

		const fullUrl = request.protocol.concat("://").concat(request.hostname);
		const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString();



		response.send({fileUrl});
	});
}