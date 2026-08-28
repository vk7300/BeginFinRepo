
export interface UserData {
  email: string;
  name: string;
  completedModules: string[];
}

const STORAGE_KEY = 'beginfin_users_db';
const SESSION_KEY = 'beginfin_current_session';

export const authService = {
  // Get all users from "database"
  getUsers: (): Record<string, UserData> => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  // Save/Update a user in "database"
  saveUser: (user: UserData) => {
    const users = authService.getUsers();
    users[user.email.toLowerCase()] = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  // Authenticate (Mock)
  login: (email: string, name?: string): UserData => {
    const users = authService.getUsers();
    const existingUser = users[email.toLowerCase()];
    
    if (existingUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(existingUser));
      return existingUser;
    }

    // Create new user if doesn't exist
    const newUser: UserData = {
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      completedModules: []
    };
    authService.saveUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Get currently logged in user
  getCurrentUser: (): UserData | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Update progress for current user
  updateProgress: (completedModules: string[]) => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      currentUser.completedModules = completedModules;
      authService.saveUser(currentUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};
