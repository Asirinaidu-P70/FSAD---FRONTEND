import { mockAdminUsers, mockLearnerUsers, trainers } from "../data/users";
import { workshops } from "../data/workshops";

const mockUsers = [...mockAdminUsers, ...mockLearnerUsers];

function resolveAfter(value, delay = 500) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay);
  });
}

function rejectAfter(message, delay = 500) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}

export function loginUser({ email, password, role }) {
  const matchedUser = mockUsers.find(
    (user) =>
      user.email.toLowerCase() === String(email).toLowerCase() &&
      user.password === password &&
      user.role === role
  );

  if (!matchedUser) {
    return rejectAfter(
      "We couldn't match that account. Try the demo credentials shown below.",
      550
    );
  }

  const { password: _password, ...user } = matchedUser;
  return resolveAfter(user, 550);
}

export function registerUser(payload) {
  const { confirmPassword, password, ...rest } = payload;
  const trainerAvatar = payload.role === "admin" ? trainers[0].avatar : trainers[2].avatar;
  const user = {
    id: `user-${Date.now()}`,
    avatar: trainerAvatar,
    title: payload.role === "admin" ? "Operations Lead" : "Product Design Student",
    company: payload.role === "admin" ? "Northstar Academy" : "Independent Learner",
    location: "Remote",
    completedHours: payload.role === "admin" ? 128 : 24,
    certificatesEarned: payload.role === "admin" ? 6 : 2,
    joinedOn: "April 2026",
    interests:
      payload.role === "admin"
        ? ["Operations", "Training Design", "Analytics"]
        : ["Product Design", "AI", "Community"],
    ...rest,
  };

  void confirmPassword;
  void password;

  return resolveAfter(user, 700);
}

export function updateUserProfile(payload) {
  return resolveAfter(payload, 450);
}

export function fetchWorkshopById(workshopId) {
  const workshop = workshops.find((item) => String(item.id) === String(workshopId));
  return resolveAfter(workshop, 350);
}
