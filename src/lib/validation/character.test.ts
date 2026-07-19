import { describe, expect, it } from "vitest";

import { characterInputSchema } from "./character";

describe("characterInputSchema", () => {
  it("trims and accepts a valid name", () => {
    const parsed = characterInputSchema.parse({ name: "  月島 灯  " });
    expect(parsed.name).toBe("月島 灯");
  });

  it("rejects a blank name", () => {
    expect(characterInputSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("accepts optional role/profile and trims them", () => {
    const parsed = characterInputSchema.parse({
      name: "月島 灯",
      role: "  主人公  ",
      profile: "  庭を継いだ少女  ",
    });
    expect(parsed.role).toBe("主人公");
    expect(parsed.profile).toBe("庭を継いだ少女");
  });

  it("accepts input without role/profile", () => {
    const parsed = characterInputSchema.parse({ name: "月島 灯" });
    expect(parsed.role).toBeUndefined();
    expect(parsed.profile).toBeUndefined();
  });
});
