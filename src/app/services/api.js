import axios from "axios";
import { mockAdminUsers, mockLearnerUsers } from "../data/users";
import { workshops as workshopSeed } from "../data/workshops";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_TOKEN_PREFIX = "mock-token:";
const MOCK_USERS_STORAGE_KEY = "workshop-platform-mock-users";
const MOCK_WORKSHOPS_STORAGE_KEY = "workshop-platform-mock-workshops";
const MOCK_REGISTRATIONS_STORAGE_KEY = "workshop-platform-mock-registrations";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
});

export function setApiAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}

function unwrapEnvelope(payload) {
  let current = payload;
  let depth = 0;

  while (current && typeof current === "object" && !Array.isArray(current) && depth < 6) {
    if ("data" in current && current.data !== current) {
      current = current.data;
      depth += 1;
      continue;
    }

    if ("result" in current && current.result !== current) {
      current = current.result;
      depth += 1;
      continue;
    }

    break;
  }

  return current;
}

function extractList(payload, keys = []) {
  const source = unwrapEnvelope(payload);

  if (Array.isArray(source)) {
    return source;
  }

  for (const key of [...keys, "items", "content", "records", "rows"]) {
    if (Array.isArray(source?.[key])) {
      return source[key];
    }
  }

  return [];
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createAvatar(name, background = "#1d4ed8", foreground = "#eff6ff") {
  const initials = String(name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${initials} avatar"><rect width="120" height="120" rx="28" fill="${background}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${foreground}" font-family="Arial, sans-serif" font-size="42" font-weight="700">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatDateValue(value) {
  if (!value) {
    return "To be announced";
  }

  if (typeof value === "string" && /[A-Za-z]{3,}/.test(value) && /\d{4}/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTimeValue(value) {
  if (!value) {
    return "To be announced";
  }

  if (typeof value === "string" && /([AP]M|UTC|GMT|IST)/i.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
}

function formatMonthYear(value) {
  if (!value) {
    return "Recently joined";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPrice(value, currencyCode = "INR") {
  if (value === null || value === undefined || value === "") {
    return "Free";
  }

  if (typeof value === "string" && /[$€£₹]/.test(value)) {
    return value;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

function mapRole(role) {
  const normalized = Array.isArray(role) ? role[0] : role;
  const value = String(normalized || "").toLowerCase();

  if (value.includes("admin")) {
    return "admin";
  }

  if (value.includes("learner") || value.includes("student") || value.includes("client")) {
    return "user";
  }

  return "user";
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredJson(key, fallbackValue) {
  if (!canUseStorage()) {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStoredJson(key, value) {
  if (!canUseStorage()) {
    return value;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function createDefaultMockUsers() {
  return [...mockAdminUsers, ...mockLearnerUsers].map((user) => ({ ...user }));
}

function createDefaultMockWorkshops() {
  return workshopSeed.map((workshop) => {
    const { registered, ...rest } = workshop;

    return {
      ...rest,
      registeredCount: typeof registered === "number" ? registered : 0,
    };
  });
}

function createDefaultMockRegistrations() {
  return [
    {
      id: "reg-101",
      userId: "user-1",
      workshopId: 101,
      status: "Upcoming",
      progress: 34,
      registeredAt: "2026-03-01T10:00:00.000Z",
    },
    {
      id: "reg-102",
      userId: "user-1",
      workshopId: 102,
      status: "In Progress",
      progress: 72,
      registeredAt: "2026-03-02T10:00:00.000Z",
    },
    {
      id: "reg-104",
      userId: "user-1",
      workshopId: 104,
      status: "In Progress",
      progress: 48,
      registeredAt: "2026-03-05T10:00:00.000Z",
    },
    {
      id: "reg-105",
      userId: "user-1",
      workshopId: 105,
      status: "In Progress",
      progress: 88,
      registeredAt: "2026-03-08T10:00:00.000Z",
    },
  ];
}

function getMockDatabase() {
  return {
    users: readStoredJson(MOCK_USERS_STORAGE_KEY, createDefaultMockUsers()),
    workshops: readStoredJson(MOCK_WORKSHOPS_STORAGE_KEY, createDefaultMockWorkshops()),
    registrations: readStoredJson(
      MOCK_REGISTRATIONS_STORAGE_KEY,
      createDefaultMockRegistrations()
    ),
  };
}

function persistMockDatabase({ users, workshops, registrations }) {
  writeStoredJson(MOCK_USERS_STORAGE_KEY, users);
  writeStoredJson(MOCK_WORKSHOPS_STORAGE_KEY, workshops);
  writeStoredJson(MOCK_REGISTRATIONS_STORAGE_KEY, registrations);
}

function buildMockToken(userId) {
  return `${MOCK_TOKEN_PREFIX}${userId}`;
}

function getCurrentToken() {
  const authorizationHeader = apiClient.defaults.headers.common.Authorization;

  if (typeof authorizationHeader !== "string") {
    return null;
  }

  return authorizationHeader.replace(/^Bearer\s+/i, "");
}

function getMockUserIdFromToken() {
  const token = getCurrentToken();

  if (!token || !token.startsWith(MOCK_TOKEN_PREFIX)) {
    return null;
  }

  return token.slice(MOCK_TOKEN_PREFIX.length);
}

function createMockApiError(message, status) {
  const error = new Error(message);
  error.response = {
    status,
    data: {
      message,
    },
  };
  return toApiError(error, message);
}

function shouldUseLocalFallback(error) {
  const status = error?.status ?? error?.response?.status;
  return !status || status === 404 || status === 405;
}

async function withLocalFallback(runRemote, runLocal) {
  try {
    return await runRemote();
  } catch (error) {
    if (!shouldUseLocalFallback(error)) {
      throw error;
    }

    return runLocal();
  }
}

function getAuthenticatedMockUser(database) {
  const userId = getMockUserIdFromToken();

  if (!userId) {
    throw createMockApiError("Please sign in to continue.", 401);
  }

  const user = database.users.find((item) => String(item.id) === String(userId));

  if (!user) {
    throw createMockApiError("Please sign in to continue.", 401);
  }

  return user;
}

function mergeWorkshopRegistrationState(workshops, registrations, userId) {
  const userRegistrations = registrations.filter(
    (registration) => String(registration.userId) === String(userId)
  );
  const registrationMap = new Map(
    userRegistrations.map((registration) => [
      String(registration.workshopId),
      registration,
    ])
  );

  return workshops.map((workshop) => {
    const registration = registrationMap.get(String(workshop.id));

    return {
      ...workshop,
      registered: Boolean(registration),
      registrationStatus: registration?.status || workshop.registrationStatus,
      progress: registration?.progress ?? workshop.progress,
    };
  });
}

function buildWorkshopStatus(seatsAvailable, seatsTotal, providedStatus) {
  if (providedStatus) {
    return providedStatus;
  }

  if (!seatsAvailable) {
    return "Closed";
  }

  if (seatsTotal && seatsAvailable / seatsTotal <= 0.2) {
    return "Filling Fast";
  }

  return "Open";
}

function normalizeTrainer(rawTrainer, workshop = {}) {
  const source = unwrapEnvelope(rawTrainer) || {};
  const name =
    source.name ||
    source.fullName ||
    source.trainerName ||
    workshop.trainerName ||
    "Workshop Trainer";
  const title =
    source.title ||
    source.role ||
    source.designation ||
    source.trainerRole ||
    workshop.trainerRole ||
    workshop.trainerTitle ||
    "Workshop Trainer";
  const expertise =
    source.expertise ||
    workshop.tags?.[0] ||
    workshop.category ||
    "Workshop Delivery";

  return {
    id:
      source.id ||
      source.trainerId ||
      workshop.trainerId ||
      `trainer-${slugify(name) || "default"}`,
    name,
    role: title,
    title,
    expertise,
    sessions: toNumber(
      source.sessions ?? source.sessionCount ?? source.workshopsCount ?? 0,
      0
    ),
    avatar:
      source.avatar ||
      source.avatarUrl ||
      source.trainerAvatar ||
      workshop.trainerAvatar ||
      source.imageUrl ||
      workshop.imageUrl ||
      createAvatar(name, "#0f172a", "#f8fafc"),
  };
}

export function normalizeUser(rawUser = {}) {
  const source = unwrapEnvelope(rawUser) || {};
  const name =
    source.name ||
    [source.firstName, source.lastName].filter(Boolean).join(" ").trim() ||
    source.username ||
    source.email ||
    "User";
  const role = mapRole(source.role || source.userRole || source.accountType);

  return {
    id: source.id || source.userId || source.uuid || `user-${slugify(name) || Date.now()}`,
    name,
    email: source.email || "",
    role,
    avatar:
      source.avatar ||
      source.avatarUrl ||
      source.profileImage ||
      createAvatar(name, role === "admin" ? "#0f172a" : "#1d4ed8", "#eff6ff"),
    title:
      source.title ||
      source.designation ||
      source.profession ||
      (role === "admin" ? "Administrator" : "Learner"),
    company: source.company || source.organization || "",
    location: source.location || source.city || source.address || "",
    phone: source.phone || source.mobile || source.contactNumber || "",
    bio: source.bio || source.about || "",
    completedHours: toNumber(
      source.completedHours ?? source.learningHours ?? source.hoursCompleted,
      0
    ),
    certificatesEarned: toNumber(
      source.certificatesEarned ?? source.certificateCount ?? source.certificates,
      0
    ),
    joinedOn: formatMonthYear(source.joinedOn || source.createdAt || source.joinedAt),
    interests: normalizeStringList(source.interests || source.skills || source.topics),
  };
}

export function normalizeWorkshop(rawWorkshop = {}) {
  const source = unwrapEnvelope(rawWorkshop) || {};
  const seatsTotal = toNumber(
    source.seatsTotal ?? source.capacity ?? source.totalSeats ?? source.maxParticipants,
    0
  );
  const registeredCount = toNumber(
    source.registeredCount ??
      (typeof source.registered === "number" ? source.registered : undefined) ??
      source.enrolledCount ??
      source.bookedSeats,
    0
  );
  const derivedSeatsAvailable = seatsTotal
    ? Math.max(seatsTotal - registeredCount, 0)
    : 0;
  const seatsAvailable = toNumber(
    source.seatsAvailable ?? source.availableSeats ?? source.remainingSeats,
    derivedSeatsAvailable
  );
  const dateValue =
    source.startDateTime || source.startAt || source.date || source.workshopDate;
  const timeValue =
    source.startDateTime || source.startAt || source.time || source.workshopTime;
  const trainer = normalizeTrainer(
    source.trainer || source.instructor || source.facilitator,
    source
  );
  const rating = toNumber(source.rating ?? source.averageRating, 0);
  const tags = normalizeStringList(source.tags || source.keywords || source.skills);
  const agenda = normalizeStringList(source.agenda || source.modules || source.topics);
  const benefits = normalizeStringList(
    source.benefits || source.outcomes || source.highlights
  );

  return {
    id: source.id || source.workshopId || source.uuid,
    title: source.title || source.name || "Untitled workshop",
    category: source.category || source.categoryName || source.domain || "Workshop",
    trainerId: trainer.id,
    trainerName: trainer.name,
    trainerRole: trainer.role || trainer.title,
    trainerAvatar: trainer.avatar,
    date: formatDateValue(dateValue),
    time: formatTimeValue(timeValue),
    seatsAvailable,
    seatsTotal: seatsTotal || Math.max(seatsAvailable + registeredCount, 1),
    rating,
    duration: source.duration || source.durationLabel || "Flexible",
    level: source.level || source.skillLevel || "All levels",
    price: formatPrice(source.price ?? source.amount ?? source.fee, source.currency),
    mode: source.mode || source.deliveryMode || source.format || "Online",
    status: buildWorkshopStatus(seatsAvailable, seatsTotal, source.status),
    nextSession:
      source.nextSession ||
      source.nextTopic ||
      (dateValue ? `Starts ${formatDateValue(dateValue)}` : "Schedule to be announced"),
    description:
      source.description ||
      source.summary ||
      "Workshop details will be published soon.",
    imageUrl:
      source.imageUrl ||
      source.image ||
      source.thumbnail ||
      trainer.avatar,
    agenda: agenda.length ? agenda : ["Agenda will be shared by the organizer."],
    benefits: benefits.length ? benefits : ["Learning outcomes will be shared soon."],
    trainer,
    tags: tags.length ? tags : [source.category || "Workshop"],
    popularity: toNumber(source.popularity ?? source.registrationRate, 0),
    completion: toNumber(source.completion ?? source.progress, 0),
    registered:
      typeof source.registered === "boolean"
        ? source.registered
        : Boolean(source.isRegistered),
    registrationId: source.registrationId || source.id,
    registrationStatus: source.registrationStatus || source.registrationState || "Registered",
  };
}

function normalizeRegistration(rawRegistration = {}) {
  const source = unwrapEnvelope(rawRegistration) || {};
  const workshopSource = source.workshop || source.session || source.course || source;
  const workshop = normalizeWorkshop(workshopSource);
  const registrationStatus =
    source.status && !["Open", "Closed", "Filling Fast", "Almost Full"].includes(source.status)
      ? source.status
      : workshop.registrationStatus || "Registered";

  return {
    ...workshop,
    registered: true,
    registrationId: source.id || source.registrationId || workshop.registrationId,
    registrationStatus,
    progress: toNumber(source.progress ?? workshop.completion, 0),
  };
}

function extractMessage(error, fallbackMessage) {
  const payload = error?.response?.data;
  const possibleMessage =
    payload?.message ||
    payload?.error ||
    payload?.details ||
    payload?.title ||
    error?.message;

  if (possibleMessage) {
    return String(possibleMessage);
  }

  return fallbackMessage;
}

function toApiError(error, fallbackMessage) {
  const wrapped = new Error(extractMessage(error, fallbackMessage));
  wrapped.status = error?.response?.status;
  wrapped.cause = error;
  wrapped.alreadyRegistered =
    wrapped.status === 409 || /already registered/i.test(wrapped.message);
  return wrapped;
}

async function requestFirst(configs, fallbackMessage) {
  let lastError = null;

  for (const config of configs) {
    try {
      return await apiClient(config);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 405) {
        lastError = error;
        continue;
      }

      throw toApiError(error, fallbackMessage);
    }
  }

  throw toApiError(lastError, fallbackMessage);
}

export async function loginUser(credentials) {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [
          { method: "post", url: "/auth/login", data: credentials },
          { method: "post", url: "/login", data: credentials },
        ],
        "Unable to sign in with the provided credentials."
      );
      const payload = unwrapEnvelope(response.data);
      const token =
        payload?.token ||
        payload?.accessToken ||
        payload?.jwt ||
        payload?.access_token ||
        null;

      if (token) {
        setApiAuthToken(token);
      }

      let userSource = payload?.user || payload?.profile || payload?.account || payload;

      if (!userSource || (!userSource.name && !userSource.email)) {
        try {
          userSource = await fetchCurrentUser();
        } catch {
          userSource = { email: credentials.email, role: credentials.role };
        }
      }

      return {
        token,
        user: normalizeUser(userSource),
      };
    },
    () => {
      const database = getMockDatabase();
      const normalizedRole = credentials?.role ? mapRole(credentials.role) : null;
      const matchedUser = database.users.find((user) => {
        const emailMatches =
          String(user.email || "").toLowerCase() ===
          String(credentials?.email || "").trim().toLowerCase();
        const passwordMatches = user.password === credentials?.password;
        const roleMatches = normalizedRole ? mapRole(user.role) === normalizedRole : true;

        return emailMatches && passwordMatches && roleMatches;
      });

      if (!matchedUser) {
        throw createMockApiError(
          "Unable to sign in with the provided credentials.",
          401
        );
      }

      const token = buildMockToken(matchedUser.id);
      setApiAuthToken(token);

      return {
        token,
        user: normalizeUser(matchedUser),
      };
    }
  );
}

export async function registerUser(payload) {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [
          { method: "post", url: "/auth/register", data: payload },
          { method: "post", url: "/register", data: payload },
        ],
        "Unable to create the account right now."
      );
      const data = unwrapEnvelope(response.data);
      const token =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.access_token ||
        null;

      if (token) {
        setApiAuthToken(token);
      }

      let userSource = data?.user || data?.profile || data;

      if (!userSource || (!userSource.name && !userSource.email)) {
        try {
          userSource = await fetchCurrentUser();
        } catch {
          userSource = payload;
        }
      }

      return {
        token,
        user: normalizeUser(userSource),
      };
    },
    () => {
      const database = getMockDatabase();
      const email = String(payload?.email || "").trim().toLowerCase();
      const duplicateUser = database.users.some(
        (user) => String(user.email || "").toLowerCase() === email
      );

      if (duplicateUser) {
        throw createMockApiError("An account with this email already exists.", 409);
      }

      const role = mapRole(payload?.role);
      const nextUser = {
        id: `${role}-${Date.now()}`,
        name: String(payload?.name || "").trim() || "New User",
        email,
        password: payload?.password || "",
        role,
        title: role === "admin" ? "Administrator" : "Learner",
        company: "",
        location: "",
        phone: "",
        bio: "",
        completedHours: 0,
        certificatesEarned: 0,
        joinedOn: new Date().toISOString(),
        interests: [],
      };

      persistMockDatabase({
        ...database,
        users: [...database.users, nextUser],
      });

      const token = buildMockToken(nextUser.id);
      setApiAuthToken(token);

      return {
        token,
        user: normalizeUser(nextUser),
      };
    }
  );
}

export async function fetchCurrentUser() {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [
          { method: "get", url: "/users/me" },
          { method: "get", url: "/profile" },
          { method: "get", url: "/auth/me" },
        ],
        "Unable to load your profile information."
      );

      return normalizeUser(response.data);
    },
    () => {
      const database = getMockDatabase();
      return normalizeUser(getAuthenticatedMockUser(database));
    }
  );
}

export async function updateCurrentUser(payload) {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [
          { method: "put", url: "/users/me", data: payload },
          { method: "put", url: "/profile", data: payload },
          { method: "patch", url: "/users/me", data: payload },
          { method: "patch", url: "/profile", data: payload },
        ],
        "Unable to update your profile right now."
      );

      const data = unwrapEnvelope(response.data);
      return normalizeUser(data && Object.keys(data).length ? data : payload);
    },
    () => {
      const database = getMockDatabase();
      const currentUser = getAuthenticatedMockUser(database);
      const nextEmail = String(payload?.email || currentUser.email || "").trim().toLowerCase();
      const emailTaken = database.users.some(
        (user) =>
          String(user.id) !== String(currentUser.id) &&
          String(user.email || "").toLowerCase() === nextEmail
      );

      if (emailTaken) {
        throw createMockApiError("Another account already uses this email address.", 409);
      }

      const nextUsers = database.users.map((user) =>
        String(user.id) === String(currentUser.id)
          ? {
              ...user,
              ...payload,
              email: nextEmail,
            }
          : user
      );

      persistMockDatabase({
        ...database,
        users: nextUsers,
      });

      const updatedUser = nextUsers.find(
        (user) => String(user.id) === String(currentUser.id)
      );

      return normalizeUser(updatedUser);
    }
  );
}

export async function fetchWorkshops() {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [{ method: "get", url: "/workshops" }],
        "Unable to load workshops right now."
      );

      return extractList(response.data, ["workshops"]).map((item) =>
        normalizeWorkshop(item)
      );
    },
    () => {
      const database = getMockDatabase();
      const userId = getMockUserIdFromToken();
      const workshops = userId
        ? mergeWorkshopRegistrationState(
            database.workshops,
            database.registrations,
            userId
          )
        : database.workshops;

      return workshops.map((item) => normalizeWorkshop(item));
    }
  );
}

export async function fetchWorkshopById(workshopId) {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [{ method: "get", url: `/workshops/${workshopId}` }],
        "Unable to load this workshop right now."
      );

      return normalizeWorkshop(response.data);
    },
    () => {
      const database = getMockDatabase();
      const userId = getMockUserIdFromToken();
      const workshops = userId
        ? mergeWorkshopRegistrationState(
            database.workshops,
            database.registrations,
            userId
          )
        : database.workshops;
      const workshop = workshops.find(
        (item) => String(item.id) === String(workshopId)
      );

      if (!workshop) {
        throw createMockApiError("Unable to load this workshop right now.", 404);
      }

      return normalizeWorkshop(workshop);
    }
  );
}

export async function fetchMyWorkshops() {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [
          { method: "get", url: "/registrations/me" },
          { method: "get", url: "/users/me/workshops" },
          { method: "get", url: "/workshops/registered" },
        ],
        "Unable to load your workshop registrations."
      );

      const registrations = extractList(response.data, ["registrations", "workshops"]);
      return registrations.map((item) => normalizeRegistration(item));
    },
    () => {
      const database = getMockDatabase();
      const currentUser = getAuthenticatedMockUser(database);
      const registrations = database.registrations
        .filter((item) => String(item.userId) === String(currentUser.id))
        .map((item) => {
          const workshop = database.workshops.find(
            (entry) => String(entry.id) === String(item.workshopId)
          );

          return normalizeRegistration({
            ...item,
            workshop,
          });
        })
        .filter((item) => item.id);

      return registrations;
    }
  );
}

export async function registerWorkshop(workshopId) {
  return withLocalFallback(
    async () => {
      const response = await requestFirst(
        [
          { method: "post", url: `/workshops/${workshopId}/register` },
          { method: "post", url: "/registrations", data: { workshopId } },
        ],
        "Unable to complete the workshop registration."
      );

      const payload = unwrapEnvelope(response.data);
      const source = payload?.workshop || payload?.registration || payload;

      if (payload?.registration || payload?.workshop || payload?.status) {
        return normalizeRegistration(payload?.registration || payload);
      }

      return normalizeRegistration(source);
    },
    () => {
      const database = getMockDatabase();
      const currentUser = getAuthenticatedMockUser(database);
      const existingRegistration = database.registrations.find(
        (item) =>
          String(item.userId) === String(currentUser.id) &&
          String(item.workshopId) === String(workshopId)
      );

      if (existingRegistration) {
        throw createMockApiError("You are already registered for this workshop.", 409);
      }

      const workshopIndex = database.workshops.findIndex(
        (item) => String(item.id) === String(workshopId)
      );

      if (workshopIndex < 0) {
        throw createMockApiError("Unable to complete the workshop registration.", 404);
      }

      const workshop = database.workshops[workshopIndex];

      if (toNumber(workshop.seatsAvailable, 0) <= 0) {
        throw createMockApiError("No seats are available for this workshop.", 409);
      }

      const updatedWorkshop = {
        ...workshop,
        seatsAvailable: Math.max(0, toNumber(workshop.seatsAvailable, 0) - 1),
        registeredCount: toNumber(workshop.registeredCount, 0) + 1,
      };
      const nextRegistration = {
        id: `reg-${Date.now()}`,
        userId: currentUser.id,
        workshopId: updatedWorkshop.id,
        status: "Registered",
        progress: 0,
        registeredAt: new Date().toISOString(),
      };
      const nextWorkshops = [...database.workshops];
      nextWorkshops[workshopIndex] = updatedWorkshop;

      persistMockDatabase({
        users: database.users,
        workshops: nextWorkshops,
        registrations: [...database.registrations, nextRegistration],
      });

      return normalizeRegistration({
        ...nextRegistration,
        workshop: updatedWorkshop,
      });
    }
  );
}
