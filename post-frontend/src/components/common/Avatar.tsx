import defaultProfileImg from "@/assets/default-profile.svg";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number; // px 단위 (기본 40)
}

export default function Avatar({ src, alt, size = 40 }: AvatarProps) {
  const imageUrl = src
    ? `${src}?t=${Date.now()}` // ✅ 캐싱 방지용 querystring
    : defaultProfileImg; // 기본 아바타 이미지

  return (
    <img
      src={imageUrl}
      alt={alt || 'profile'}
      style={{ width: size, height: size }}
      className="rounded-full object-cover border"
    />
  );
}
