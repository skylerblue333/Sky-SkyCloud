export type CloudProvider = "aws" | "azure" | "gcp" | "other";

export interface DeploymentPlan {
  id: string;
  provider: CloudProvider;
  region: string;
  service: string;
  replicas: number;
  requiredEnv: readonly string[];
}

export interface PlanAssessment {
  plan: DeploymentPlan;
  missingEnvironment: readonly string[];
  deployableByConfiguration: boolean;
  deploymentPerformed: false;
}

const ID_RE = /^[A-Za-z0-9._-]{1,96}$/;
const TOKEN_RE = /^[A-Z][A-Z0-9_]{0,63}$/;
const REGION_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;

export function assessDeploymentPlan(plan: DeploymentPlan, availableEnv: readonly string[]): PlanAssessment {
  if (!ID_RE.test(plan.id)) throw new Error("invalid plan id");
  if (!ID_RE.test(plan.service)) throw new Error("invalid service id");
  if (!REGION_RE.test(plan.region)) throw new Error("invalid region");
  if (!Number.isInteger(plan.replicas) || plan.replicas < 1 || plan.replicas > 100) throw new Error("invalid replica count");
  if (plan.requiredEnv.length > 64 || plan.requiredEnv.some((key) => !TOKEN_RE.test(key))) throw new Error("invalid environment requirement");

  const required = [...new Set(plan.requiredEnv)].sort();
  const available = new Set(availableEnv);
  const missingEnvironment = required.filter((key) => !available.has(key));
  const normalized: DeploymentPlan = Object.freeze({ ...plan, requiredEnv: Object.freeze(required) });
  return Object.freeze({
    plan: normalized,
    missingEnvironment: Object.freeze(missingEnvironment),
    deployableByConfiguration: missingEnvironment.length === 0,
    deploymentPerformed: false
  });
}
