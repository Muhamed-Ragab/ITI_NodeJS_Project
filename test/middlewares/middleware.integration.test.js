import { once } from "node:events";
import express from "express";
import { StatusCodes } from "http-status-codes";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { errorHandler } from "../../src/middlewares/error.middleware.js";
import { validate } from "../../src/middlewares/validate.middleware.js";
import { sendSuccess } from "../../src/utils/response.js";

const app = express();
app.use(express.json());

app.post(
	"/users",
	validate({
		body: z.object({
			email: z.string().email(),
			age: z.coerce.number().int().positive(),
		}),
	}),
	(req, res) => {
		return sendSuccess(res, {
			statusCode: StatusCodes.CREATED,
			data: req.body,
			message: "User validated",
		});
	}
);

app.get("/boom", (_req, _res, next) => {
	next({
		statusCode: StatusCodes.IM_A_TEAPOT,
		code: "TEAPOT",
		message: "Teapot",
	});
});

app.use(errorHandler);

let server;
let baseUrl;

beforeAll(async () => {
	server = app.listen(0);
	await once(server, "listening");
	const { port } = server.address();
	baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
	await new Promise((resolve, reject) => {
		server.close((error) => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
});

describe("middleware integration", () => {
	it("returns standardized validation error envelope", async () => {
		const response = await fetch(`${baseUrl}/users`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "invalid-email", age: -5 }),
		});
		const body = await response.json();

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe("VALIDATION_ERROR");
		expect(Array.isArray(body.error.details)).toBe(true);
	});

	it("returns standardized success envelope", async () => {
		const response = await fetch(`${baseUrl}/users`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: "user@example.com", age: "21" }),
		});
		const body = await response.json();

		expect(response.status).toBe(StatusCodes.CREATED);
		expect(body).toEqual({
			success: true,
			data: { email: "user@example.com", age: 21 },
			message: "User validated",
		});
	});

	it("maps non-validation errors through standardized error envelope", async () => {
		const response = await fetch(`${baseUrl}/boom`);
		const body = await response.json();

		expect(response.status).toBe(StatusCodes.IM_A_TEAPOT);
		expect(body).toEqual({
			success: false,
			error: { code: "TEAPOT" },
			message: "Teapot",
		});
	});
});
