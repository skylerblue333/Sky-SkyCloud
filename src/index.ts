export type CloudProvider = "aws" | "azure" | "gcp" | "local";
export type ResourceKind = "compute" | "database" | "cache" | "queue" | "object-storage";

export interface ResourceManifest {
  readonly id: string;
  readonly provider: CloudProvider;
  readonly kind: ResourceKind;
  readonly region: string;
  readonly size: string;
  readonly replicas: number;
  readonly tags?: Readonly<Record<string, string>>;
}

export interface ResourcePlan {
  readonly resource: ResourceManifest;
  readonly action: "create" | "unchanged";
  readonly infrastructureMutated: false;
}

const ID_RE = /^[A-Za-z0-9._-]{1,96}$/;
const TOKEN_RE = /^[A-Za-z0-9._-]{1,64}$/;
const MAX_RESOURCES = 2_000;
const MAX_TAGS = 32;

export class CloudResourceRegistry {
  readonly #resources = new Map<string, ResourceManifest>();

  register(input: ResourceManifest): ResourcePlan {
    const resource = this.#normalize(input);
    const existing = this.#resources.get(resource.id);
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(resource)) {
        throw new Error("resource id already registered with different desired state");
      }
      return { resource: existing, action: "unchanged", infrastructureMutated: false };
    }
    if (this.#resources.size >= MAX_RESOURCES) throw new Error("resource capacity exceeded");
    this.#resources.set(resource.id, resource);
    return { resource, action: "create", infrastructureMutated: false };
  }

  get(id: string): ResourceManifest {
    const resource = this.#resources.get(this.#validateToken(id, "resource id", ID_RE));
    if (!resource) throw new Error("resource not found");
    return resource;
  }

  list(): readonly ResourceManifest[] {
    return Object.freeze([...this.#resources.values()].sort((a, b) => a.id.localeCompare(b.id)));
  }

  #normalize(input: ResourceManifest): ResourceManifest {
    const id = this.#validateToken(input.id, "resource id", ID_RE);
    const region = this.#validateToken(input.region, "region", TOKEN_RE);
    const size = this.#validateToken(input.size, "size", TOKEN_RE);
    if (!["aws", "azure", "gcp", "local"].includes(input.provider)) throw new Error("unsupported provider");
    if (!["compute", "database", "cache", "queue", "object-storage"].includes(input.kind)) throw new Error("unsupported resource kind");
    if (!Number.isInteger(input.replicas) || input.replicas < 1 || input.replicas > 100) throw new Error("replicas must be an integer between 1 and 100");

    const tags = input.tags ?? {};
    const entries = Object.entries(tags);
    if (entries.length > MAX_TAGS) throw new Error("too many tags");
    const normalizedTags: Record<string, string> = {};
    for (const [key, value] of entries.sort(([a], [b]) => a.localeCompare(b))) {
      const normalizedKey = this.#validateToken(key, "tag key", TOKEN_RE);
      if (typeof value !== "string" || value.length > 128) throw new Error("tag value must be at most 128 characters");
      normalizedTags[normalizedKey] = value;
    }

    return Object.freeze({ id, provider: input.provider, kind: input.kind, region, size, replicas: input.replicas, tags: Object.freeze(normalizedTags) });
  }

  #validateToken(value: string, label: string, pattern: RegExp): string {
    if (typeof value !== "string" || !pattern.test(value)) throw new Error(`invalid ${label}`);
    return value;
  }
}
