import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../libs/prisma";


export async function memmoriesRoutes(app:FastifyInstance) {


	app.get("/memories", async (request, response) => {
		

		const  memories = await prisma.memory.findMany({
			where: {
				userId: request.user.sub
			},
			orderBy: {
				createdAt: "asc"
			}
		});

		const memoriesFormated = memories.map(memory => {
			const excerpt = memory.content.slice(0,115).concat("...");
			return {
				id: memory.id,
				coverUrl: memory.coverUrl,
				excerpt
        

			};
		});

		return response.status(200).send({memories: memoriesFormated});

	});


	app.get("/memories/:id", async (request, response) => {
		const requestParamsSchema = z.object({
			id: z.string().uuid("id must be a valid uuid"),
		});

		
		const { id } = requestParamsSchema.parse(request.params);

		
		
		const memory = await prisma.memory.findUnique({
			where: {
				id:id
			}
		});

		if(!memory){
			return response.status(404).send({message: "Memory not found"});
		}

		if(!memory.IsPublic && memory.userId !== request.user.sub){
			return response.status(403).send({message: "You don't have permission to access this memory"});
		}




		return response.status(200).send(memory);

	});

	app.post("/memories", async (request, response) => {
		
		const requestBodySchema = z.object({
			content: z.string().min(1, "content must be at least 1 character long"),
			coverUrl: z.string().url("coverUrl must be a valid url"),
			isPublic: z.coerce.boolean().default(false),    
		});

		const memory = requestBodySchema.parse(request.body);

		await prisma.memory.create({
			data: {
				content: memory.content,
				coverUrl: memory.coverUrl,
				IsPublic: memory.isPublic,
				userId: request.user.sub
			}
		});

		return response.status(201).send({memory});

	});
    
	app.put("/memories/:id", async (request, response) => {
		const requestParamsSchema = z.object({
			id: z.string().uuid("id must be a valid uuid"),
		});

		const { id:memmorieId } = requestParamsSchema.parse(request.params);


		const requestBodySchema = z.object({
			content: z.string().min(1, "content must be at least 1 character long"),
			coverUrl: z.string().url("coverUrl must be a valid url"),
			isPublic: z.coerce.boolean().default(false),
            
		});

		const memoryContent = requestBodySchema.parse(request.body);

		const memory = await prisma.memory.findUniqueOrThrow({
			where: {
				id:memmorieId
			},
		});

		if(memory.userId !== request.user.sub){
			return response.status(403).send({message: "You don't have permission to access this memory"});
		}


		const updatedMemory = await prisma.memory.update({
			where: {
				id:memmorieId
			},
			data: {
				content: memoryContent.content,
				coverUrl: memoryContent.coverUrl,
				IsPublic: memoryContent.isPublic,
			}
            
		});

		return updatedMemory;



	});

	app.delete("/memories/:id", async (request,response) => {
		const requestParamsSchema = z.object({
			id: z.string().uuid("id must be a valid uuid"),
		});

		const { id:memoryId } = requestParamsSchema.parse(request.params);


		const memory = await prisma.memory.findUniqueOrThrow({
			where: {
				id:memoryId
			},
		});

		if(memory.userId !== request.user.sub){
			return response.status(403).send({message: "You don't have permission to access this memory"});
		}

		await prisma.memory.delete({
			where: {
				id: memoryId
			}
		});

	});
}
