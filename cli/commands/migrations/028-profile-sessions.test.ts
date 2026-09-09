import { describe, expect, it } from "vitest";
import { migrateProfileSessions } from "./028-profile-sessions.js";

describe("profile session migration metadata", () => {
  it("does not require project asset reconciliation", () => {
    expect(migrateProfileSessions.requiresReconcile).toBe(false);
  });
});
