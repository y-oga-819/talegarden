import { describe, expect, it } from "vitest";

import { credentialsSchema } from "./auth";

describe("credentialsSchema", () => {
  it("accepts a valid email and 8+ char password", () => {
    const parsed = credentialsSchema.parse({
      email: "author@example.com",
      password: "gardener1",
    });
    expect(parsed.email).toBe("author@example.com");
  });

  it("rejects an invalid email", () => {
    expect(
      credentialsSchema.safeParse({ email: "nope", password: "gardener1" }).success,
    ).toBe(false);
  });

  it("rejects a password shorter than 8 chars", () => {
    expect(
      credentialsSchema.safeParse({ email: "a@example.com", password: "short" }).success,
    ).toBe(false);
  });
});
