import { describe, expect, it } from "vitest";
import { CloudResourceRegistry } from "../src/index";

const manifest = {
  id: "api.compute",
  provider: "aws" as const,
  kind: "compute" as const,
  region: "us-east-1",
  size: "small",
  replicas: 2,
  tags: { environment: "staging", service: "api" },
};

describe("CloudResourceRegistry", () => {
  it("registers desired state without claiming infrastructure mutation", () => {
    const registry = new CloudResourceRegistry();
    const plan = registry.register(manifest);
    expect(plan.action).toBe("create");
    expect(plan.infrastructureMutated).toBe(false);
    expect(plan.resource.id).toBe("api.compute");
  });

  it("treats identical registrations as idempotent", () => {
    const registry = new CloudResourceRegistry();
    registry.register(manifest);
    expect(registry.register(manifest).action).toBe("unchanged");
  });

  it("rejects conflicting desired state for the same resource id", () => {
    const registry = new CloudResourceRegistry();
    registry.register(manifest);
    expect(() => registry.register({ ...manifest, replicas: 3 })).toThrow("different desired state");
  });

  it("validates provider, kinds, replica bounds, and identifiers", () => {
    const registry = new CloudResourceRegistry();
    expect(() => registry.register({ ...manifest, id: "bad id" })).toThrow("invalid resource id");
    expect(() => registry.register({ ...manifest, replicas: 0 })).toThrow("replicas");
    expect(() => registry.register({ ...manifest, provider: "other" as never })).toThrow("unsupported provider");
    expect(() => registry.register({ ...manifest, kind: "other" as never })).toThrow("unsupported resource kind");
  });

  it("lists manifests deterministically", () => {
    const registry = new CloudResourceRegistry();
    registry.register({ ...manifest, id: "z.resource" });
    registry.register({ ...manifest, id: "a.resource" });
    expect(registry.list().map((item) => item.id)).toEqual(["a.resource", "z.resource"]);
  });
});
