import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../src/utils/errors/api-error.js";

vi.mock("../../../src/modules/coupons/coupons.repository.js", () => ({
	create: vi.fn(),
	findById: vi.fn(),
	findByCode: vi.fn(),
	updateById: vi.fn(),
	softDeleteById: vi.fn(),
	list: vi.fn(),
	consumeUsage: vi.fn(),
}));

const couponsRepository = await import(
	"../../../src/modules/coupons/coupons.repository.js"
);
const couponsService = await import(
	"../../../src/modules/coupons/coupons.service.js"
);

describe("Coupons Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates coupon when code is unique", async () => {
		couponsRepository.findByCode.mockResolvedValue(null);
		couponsRepository.create.mockResolvedValue({ _id: "c1", code: "SAVE10" });

		const result = await couponsService.createCoupon({
			code: "SAVE10",
			type: "percentage",
			value: 10,
		});

		expect(result._id).toBe("c1");
	});

	it("throws when code already exists", async () => {
		couponsRepository.findByCode.mockResolvedValue({ _id: "c1" });

		await expect(
			couponsService.createCoupon({ code: "SAVE10", type: "fixed", value: 10 })
		).rejects.toBeInstanceOf(ApiError);
	});

	it("validates coupon and calculates percentage discount", async () => {
		couponsRepository.findByCode.mockResolvedValue({
			_id: "c1",
			code: "SAVE10",
			type: "percentage",
			value: 10,
			is_active: true,
			starts_at: null,
			ends_at: null,
			min_order_amount: 0,
			usage_limit: null,
			used_count: 0,
			per_user_limit: 2,
			usage_by_user: new Map([["u1", 1]]),
		});

		const result = await couponsService.validateCouponForOrder({
			code: "SAVE10",
			userId: "u1",
			subtotalAmount: 200,
		});

		expect(result.discountAmount).toBe(20);
		expect(result.couponInfo.code).toBe("SAVE10");
	});

	it("throws when per-user limit is reached", async () => {
		couponsRepository.findByCode.mockResolvedValue({
			_id: "c1",
			code: "SAVE10",
			type: "percentage",
			value: 10,
			is_active: true,
			starts_at: null,
			ends_at: null,
			min_order_amount: 0,
			usage_limit: null,
			used_count: 1,
			per_user_limit: 1,
			usage_by_user: new Map([["u1", 1]]),
		});

		await expect(
			couponsService.validateCouponForOrder({
				code: "SAVE10",
				userId: "u1",
				subtotalAmount: 100,
			})
		).rejects.toMatchObject({ code: "COUPON.USER_LIMIT_REACHED" });
	});
});
