import { once } from "node:events";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../src/app.js";

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

describe("app response envelope examples", () => {
	it("returns standardized success envelope for root route", async () => {
		const response = await fetch(`${baseUrl}/`);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.data).toHaveProperty("version");
		expect(body.message).toBe("API is running!");
	});

	it("provides team example route for success flow", async () => {
		const response = await fetch(`${baseUrl}/examples/response`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Mohamed", role: "member" }),
		});
		const body = await response.json();

		expect(response.status).toBe(201);
		expect(body).toEqual({
			success: true,
			data: { name: "Mohamed", role: "member" },
			message: "Example response created successfully",
		});
	});

	it("provides team example route for business error flow", async () => {
		const response = await fetch(`${baseUrl}/examples/response`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "error", role: "member" }),
		});
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual({
			success: false,
			error: {
				code: "EXAMPLE_BUSINESS_ERROR",
				details: {
					name: "Please use any name except 'error'.",
				},
			},
			message: "Example business rule failed",
		});
	});
});
