import { beforeEach, describe, expect, it } from "vitest";
import { isSignedIn, signIn, signOut } from "@/lib/app-state";

describe("Unified demo account", () => {
  beforeEach(() => localStorage.clear());
  it("enters the app without selecting a role", () => {
    expect(isSignedIn()).toBe(false);
    signIn();
    expect(isSignedIn()).toBe(true);
    expect(localStorage.getItem("qpi.role")).toBeNull();
  });
  it.each(["consumer", "producer"])("preserves legacy %s access with no role distinction", legacy => {
    localStorage.setItem("qpi.role", legacy);
    expect(isSignedIn()).toBe(true);
    signIn();
    expect(localStorage.getItem("qpi.role")).toBeNull();
    expect(localStorage.getItem("qpi.session")).toBe("active");
  });
  it("signs out both current and legacy demo sessions", () => {
    signIn(); localStorage.setItem("qpi.role", "producer"); signOut();
    expect(isSignedIn()).toBe(false);
  });
});