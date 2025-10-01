export const AUTH_STORAGE_KEY = "facultyAuth";

export const isAuthenticated = () => {
  try {
    const authData = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return false;
    
    const parsed = JSON.parse(authData);
    return parsed.isAuthenticated === true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const authData = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;
    
    return JSON.parse(authData);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const logout = () => {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
};

export const getUserDisplayName = () => {
  const user = getCurrentUser();
  if (!user) return "Guest";
  
  return user.username.charAt(0).toUpperCase() + user.username.slice(1);
};

export const isSessionExpired = () => {
  const user = getCurrentUser();
  if (!user || !user.loginTime) return true;
  
  return false;
};

export const getLoginDuration = () => {
  const user = getCurrentUser();
  if (!user || !user.loginTime) return "Unknown";
  
  const loginTime = new Date(user.loginTime);
  const now = new Date();
  const diffMs = now - loginTime;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};