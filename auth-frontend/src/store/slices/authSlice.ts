import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosAuth from "@/api/axiosAuth";
import { fetchProfileImage } from "@/api/profileImageApi";

interface AuthUser {
  id?: string;
  uuid?: string;
  username?: string;
  nickname?: string;
  email?: string;
  role?: string;
  status?: string;
  profileImageUrl?: string | null;
  [key: string]: unknown;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  deletedAt?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "deleted" | "error";
}

export const fetchProfile = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: "unauthenticated" | "error" }
>(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosAuth.get<AuthUser>("/me", {});
      const profile = res.data;

      let profileImageUrl: string | null = profile.profileImageUrl ?? null;

      if (!profileImageUrl && profile.uuid) {
        try {
          const profileImage = await fetchProfileImage(profile.uuid);
          profileImageUrl = profileImage.publicUrl;
        } catch {
          profileImageUrl = null; // fallback when profile image fetch fails
        }
      }

      return {
        ...profile,
        profileImageUrl,
      };
    } catch (err: any) {
       
      if (err.response && [401, 403].includes(err.response.status)) {
        return rejectWithValue("unauthenticated");
      }
      //return rejectWithValue("error");
      return rejectWithValue("unauthenticated");
    }
  }
);


export const logoutThunk = createAsyncThunk<void>("auth/logout", async () => {
  await axiosAuth.post("/logout", {}); // 204 ????
});

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        //state.status = "authenticated";
        if (action.payload.deleted) {
          state.status = "deleted";   // 🔥 핵심
        } else {
          state.status = "authenticated";
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        if (action.payload === "unauthenticated") {
          state.status = "unauthenticated";
        } else {
          state.status = "error";
        }
      })
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;