import { describe, expect, it } from "vitest";
import { envSchema } from "../../../src/config/env.js";

describe("env schema", () => {
	it("accepts a minimal valid env object", () => {
		const valid = {
			NODE_ENV: "test",
			PORT: "3000",
			MONGODB_URI: "mongodb://127.0.0.1:27017/testdb",
			JWT_SECRET: "a".repeat(32),
			APP_BASE_URL: "http://localhost:3000",
			BACKEND_API_URL: "http://localhost:3000",
		};

		const parsed = envSchema.parse(valid);
		expect(parsed.NODE_ENV).toBe("test");
		expect(parsed.PORT).toBe(3000);
		expect(parsed.APP_BASE_URL).toBe("http://localhost:3000");
		expect(parsed.BACKEND_API_URL).toBe("http://localhost:3000");
	});

	it("rejects invalid mongo url", () => {
		const bad = {
			NODE_ENV: "test",
			PORT: "3000",
			MONGODB_URI: "not-a-url",
			JWT_SECRET: "a".repeat(32),
		};

		expect(() => envSchema.parse(bad)).toThrow();
	});
});
