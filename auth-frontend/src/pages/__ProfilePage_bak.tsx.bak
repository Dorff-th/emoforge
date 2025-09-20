// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";

interface Profile {
  uuid: string;
  username: string;
  nickname: string;
  role: string;
  status: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    axiosInstance.get("/auth/me")
      .then((res) => setProfile(res.data))
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">내 프로필</h1>
      <p><b>UUID:</b> {profile.uuid}</p>
      <p><b>Email:</b> {profile.username}</p>
      <p><b>닉네임:</b> {profile.nickname}</p>
      <p><b>Role:</b> {profile.role}</p>
      <p><b>Status:</b> {profile.status}</p>
    </div>
  );
}
