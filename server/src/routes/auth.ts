import axios from "axios";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../libs/prisma";


interface GithubAccessTokenResponseProps {
	access_token: string;
}

export async  function authRoutes(app: FastifyInstance){

	
	app.post("/register", async (request, response) => {
		const requestParamsSchema = z.object({
			code: z.string()
		});

		const { code } = requestParamsSchema.parse(request.body);

		const accessTokenResponse = await axios.post<GithubAccessTokenResponseProps>(
			"https://github.com/login/oauth/access_token",
			null,
			{
				params: {
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
					code: code
				},
				headers: {
					"Accept": "application/json"
				}
			}
		
		);

		const { access_token } = accessTokenResponse.data;

		const userResponse = await axios.get("https://api.github.com/user", {
			headers: {
				authorization: `Bearer ${access_token}`
			}
		});

		const userSchema = z.object({
			login: z.string(),
			id: z.number(),
			name: z.string(),	
			avatar_url: z.string().url(),
		});


		const useInfo = userSchema.parse(userResponse.data);

		let user = await prisma.user.findUnique({
			where: {
				githubId: useInfo.id
			}
		});

	
		if(!user){
			user = await prisma.user.create({
				data: {
					githubId: useInfo.id,
					name: useInfo.name,
					login: useInfo.login,
					avatarUrl: useInfo.avatar_url
				}
			});
		}

		const token = app.jwt.sign({
			name: user.name,
			avatarUrl: user.avatarUrl,
		}, {
			sub: user.id,
			expiresIn: "15 days"
		});


		response.status(201).send({token});

	});
}