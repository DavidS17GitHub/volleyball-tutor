import { CosmosClient } from "@azure/cosmos";
import { config } from "./config.js";
import type { PlanStatus, UserProfile, UserRole } from "./types.js";

const roles: UserRole[] = ["free", "premium", "admin"];
const planStatuses: PlanStatus[] = ["inactive", "active", "trialing", "past_due", "canceled"];

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UserProfile>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.userId === "string" &&
    roles.includes(candidate.role as UserRole) &&
    planStatuses.includes(candidate.planStatus as PlanStatus) &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    (candidate.email === undefined || typeof candidate.email === "string") &&
    (candidate.displayName === undefined || typeof candidate.displayName === "string")
  );
};

let client: CosmosClient | undefined;

const getContainer = () => {
  if (!config.cosmosConnectionString) {
    throw new Error("Missing required environment variable: COSMOS_CONNECTION_STRING");
  }

  client ??= new CosmosClient(config.cosmosConnectionString);

  return client
    .database(config.cosmosDatabaseName)
    .container(config.cosmosUserProfilesContainerName);
};

const createDefaultProfile = (input: {
  userId: string;
  email?: string;
  displayName?: string;
}): UserProfile => {
  const now = new Date().toISOString();

  return {
    id: input.userId,
    userId: input.userId,
    email: input.email,
    displayName: input.displayName,
    role: "free",
    planStatus: "inactive",
    createdAt: now,
    updatedAt: now,
  };
};

export async function getUserProfile(userId: string): Promise<UserProfile | undefined> {
  try {
    const { resource } = await getContainer().item(userId, userId).read<UserProfile>();

    if (!resource) {
      return undefined;
    }

    if (!isUserProfile(resource)) {
      throw new Error(`User profile document is invalid: ${userId}`);
    }

    return resource;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 404) {
      return undefined;
    }

    throw error;
  }
}

export async function getOrCreateUserProfile(input: {
  userId: string;
  email?: string;
  displayName?: string;
}): Promise<UserProfile> {
  const existing = await getUserProfile(input.userId);

  if (existing) {
    return existing;
  }

  const profile = createDefaultProfile(input);
  const { resource } = await getContainer().items.create<UserProfile>(profile);

  if (!resource || !isUserProfile(resource)) {
    throw new Error(`Unable to create user profile: ${input.userId}`);
  }

  return resource;
}

export function hasPremiumAccess(profile: UserProfile) {
  return (
    profile.role === "admin" ||
    (profile.role === "premium" &&
      (profile.planStatus === "active" || profile.planStatus === "trialing"))
  );
}
