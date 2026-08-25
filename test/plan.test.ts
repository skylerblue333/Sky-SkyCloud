import assert from "node:assert/strict";
import test from "node:test";
import { assessDeploymentPlan } from "../src/index.js";

test("reports configuration readiness without claiming deployment", () => {
  const assessment = assessDeploymentPlan({
    id: "plan.api",
    provider: "aws",
    region: "us-east-1",
    service: "service.api",
    replicas: 2,
    requiredEnv: ["DATABASE_URL", "API_KEY", "DATABASE_URL"]
  }, ["DATABASE_URL"]);

  assert.deepEqual(assessment.missingEnvironment, ["API_KEY"]);
  assert.equal(assessment.deployableByConfiguration, false);
  assert.equal(assessment.deploymentPerformed, false);
});

test("configuration complete still does not mean deployment occurred", () => {
  const assessment = assessDeploymentPlan({ id: "p", provider: "gcp", region: "us-central1", service: "svc", replicas: 1, requiredEnv: [] }, []);
  assert.equal(assessment.deployableByConfiguration, true);
  assert.equal(assessment.deploymentPerformed, false);
});

test("rejects malformed plans", () => {
  assert.throws(() => assessDeploymentPlan({ id: "bad id", provider: "aws", region: "us-east-1", service: "svc", replicas: 1, requiredEnv: [] }, []));
  assert.throws(() => assessDeploymentPlan({ id: "p", provider: "aws", region: "us-east-1", service: "svc", replicas: 0, requiredEnv: [] }, []));
});
