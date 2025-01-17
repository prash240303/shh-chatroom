import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAuthTokenFromCookie = (): string | null => {

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token") {
      return value;
    }
  }
  return null;
};

export const isAuthTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Invalid token format:", error);
    return false;
  }
};

export const checkAndRedirectIfUnauthenticated = (): void => {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room_id");
  const authToken = getAuthTokenFromCookie();
  if (authToken) {
    if (roomId) {
      axios
        .post(`${BASE_URL}room/join/`, { room_id: roomId }, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then(() => console.log("Successfully joined the room:", roomId))
        .catch((error) => {
          console.error("Error joining room:", error);
          window.location.href = "/error?message=Invalid room ID";
        });
    }
  }
  else {
    if (roomId) {
      window.location.href = `/login?room_id=${roomId}`
    }
    else {
      window.location.href = "/login"
    }
  }
};





// 



export const handleLogout = (): void => {
  console.log("handle logout called")
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = `/login`;
};

