import Fastify from "fastify";
import { memmoriesRoutes } from "./routes/memories";
import cors from "@fastify/cors";
import { authRoutes } from "./routes/auth";
import "dotenv/config";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import { uploadRoutes } from "./routes/upload";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";

const app = Fastify({
	logger: true
});


app.register(fastifyMultipart);

app.register(fastifyJwt, {
	secret: String( process.env.JWT_SECRET)
});

app.register(fastifyStatic, {
	root: resolve(__dirname, "../uploads"),
	prefix: "/uploads"
});

app.register(cors, {
	origin: true
});

app.register(memmoriesRoutes);
app.register(authRoutes);
app.register(uploadRoutes);

app.listen({port: 3333, host: "0.0.0.0"},(error) => {
	if(!error){
		console.log("😁😁 Server listening on http://localhost:3333");
	}
	console.log(error);
});


