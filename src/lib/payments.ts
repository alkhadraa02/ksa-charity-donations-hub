import { randomBytes } from "node:crypto";

export interface ChargeRequest {
  amount: number;
  currency: "SAR";
  recurring: boolean;
  description: string;
  /** Our own reference (the receipt number) so the provider can reconcile. */
  reference: string;
}

export interface ChargeResult {
  ok: boolean;
  providerRef?: string;
  error?: string;
}

/**
 * Every payment gateway sits behind this interface. The app never talks to a
 * real gateway: the bundled MockPaymentProvider approves every charge.
 * To integrate a real gateway, implement this interface and return it from
 * getPaymentProvider().
 */
export interface PaymentProvider {
  readonly name: string;
  charge(request: ChargeRequest): Promise<ChargeResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      return { ok: false, error: "مبلغ غير صالح" };
    }
    return { ok: true, providerRef: `mock_${randomBytes(6).toString("hex")}` };
  }
}

export function getPaymentProvider(): PaymentProvider {
  // Only the mock provider ships with this project.
  return new MockPaymentProvider();
}
