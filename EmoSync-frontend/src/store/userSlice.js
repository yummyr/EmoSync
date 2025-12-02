import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  logout,
  updateUser,
  updatePassword,
} from "@/api/user";

// Secure localStorage utility
const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // Try to parse as JSON first
      try {
        return JSON.parse(item);
      } catch {
        // If parsing fails, return as string (for tokens)
        return item;
      }
    } catch (error) {
      console.warn(`Failed to parse localStorage item: ${key}`, error);
      localStorage.removeItem(key);
      return null;
    }
  },

  set(key, value) {
    try {
      // Don't stringify strings (especially tokens) to avoid extra quotes
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set localStorage item: ${key}`, error);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage item: ${key}`, error);
    }
  },
};

// Initial state
const initialState = {
  user: storage.get("user") || null,
  token: storage.get("token") || "",
  roleType: storage.get("roleType") || null,
  isLoading: false,
  error: null,
};

// --- Thunks ---
export const loginUser = createAsyncThunk(
  "user/login",
  async (loginForm, { rejectWithValue }) => {
    try {
      const data = await login(loginForm); // data should be { user, token, roleType }

      console.log("Raw login API response:", data);

      // Validate the response data structure
      if (!data) {
        throw new Error("No data returned from login API");
      }

      // Handle different possible response structures
      const { user, token, roleType, userInfo, roleCode } = data;

      // If the API returns userInfo instead of user, use that
      const userData = user || userInfo;

      // Check for token in different possible locations
      const userToken = token || data.accessToken || data.authorization;

      console.log("Processed login data:", { userData, userToken, roleType, roleCode });

      if (!userData && !userToken) {
        // If no user data but we have some response, try to work with it
        console.warn("Login API returned minimal data, proceeding with basic info");
        return {
          user: { username: loginForm.username }, // Minimal user data
          token: userToken || "temp-token", // Use whatever token we got
          roleType: roleType || roleCode ? (roleCode === 'admin' ? 2 : 1) : 1
        };
      }

      if (!userData) {
        throw new Error("Invalid login response: missing user data");
      }

      if (!userToken) {
        throw new Error("Invalid login response: missing token");
      }

      return {
        user: userData,
        token: userToken,
        roleType: roleType || userData.userType || (roleCode === 'admin' ? 2 : 1) || 1
      };
    } catch (err) {
      console.error("Login error:", err);
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk("user/logout", async () => {
  await logout();
});

// export const fetchCurrentUser = createAsyncThunk(
//   "user/fetchCurrentUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       const data = await getCurrentUser();
//       return data;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const updateProfileInfo = createAsyncThunk(
//   "user/updateProfileInfo",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const data = await updateUser(formData);
//       return data;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

export const fetchCurrentUser = createAsyncThunk(
  "user/current",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user, token } = getState().user;

      // First check local cache
      if (user && token) {
        return user;
      }

      // Return null instead of throwing error to prevent component crashes
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateProfileInfo = createAsyncThunk(
  "user/profile",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await updateUser(formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
export const changePassword = createAsyncThunk(
  "user/password",
 async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
  
      await updatePassword({ oldPassword, newPassword });
      return true; 
    } catch (err) {
      return rejectWithValue(err.message || "Failed to change password");
    }
  }
);
// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, token, roleType } = action.payload;

        state.isLoading = false;
        state.user = user;
        state.token = token;
        state.roleType = roleType;

        // Persist
        storage.set("user", user);
        storage.set("token", token);
        storage.set("roleType", roleType);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = "";
        state.roleType = null;

        localStorage.clear();
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          storage.set("user", state.user);
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
      })

      .addCase(updateProfileInfo.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        storage.set("user", state.user);
      })
       // 🔐 Change Password
    .addCase(changePassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false;
    })
    .addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to change password";
    });
  },
});

export const { clearError } = userSlice.actions;

// --- Selectors ---
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;
export const selectRoleType = (state) => state.user.roleType;
export const selectIsLoading = (state) => state.user.isLoading;
export const selectError = (state) => state.user.error;

export const selectIsLoggedIn = (state) =>
  !!state.user.token && !!state.user.user;

export const selectIsAdmin = (state) => state.user.roleType === 2;
export const selectIsUser = (state) => state.user.roleType === 1;

export default userSlice.reducer;
