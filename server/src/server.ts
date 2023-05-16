import Fastify from "fastify";
import { prisma } from "../libs/prisma";

const app = Fastify({
	logger: true
});

app.get("/", async (request, respnse) => {
	return { hello: "world" };
});

app.get("/users", async (request, response) => {
	const users = await prisma.user.findMany();
	return response.status(200).send(users);

});




app.listen({port: 3333},(error, address) => {
	if(!error){
		console.log("😁😁 Server listening on http://localhost:3333");
	}
	console.log(error);
});


