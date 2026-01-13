import {
  Settings,
  ShieldCheck,
  Layers,
  Link,
  UserCheck,
  Database,
  Cpu,
  Cloud,
} from "lucide-react";

function KeyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3L15.5 7.5z" />
    </svg>
  );
}

export const keywordData = [
  {
    id: 1,
    name: "MSA",
    value: 15,
    context:
      "프로젝트의 근간이 되는 설계 방식으로, 서비스별 DB 분리 및 독립적 실행을 강조함.",
    category: "Architecture",
    icon: Layers,
  },
  {
    id: 2,
    name: "Auth-Service",
    value: 12,
    context: "인증, 회원 관리, JWT 발급 및 쿠키 관리를 담당하는 핵심 서비스임.",
    category: "Service",
    icon: ShieldCheck,
  },
  {
    id: 3,
    name: "JWT",
    value: 10,
    context: "서비스 간 인증 공유(SSO)를 위한 표준 토큰 방식으로 사용됨.",
    category: "Security",
    icon: KeyIcon,
  },
  {
    id: 4,
    name: "BFF",
    value: 8,
    context:
      "분리된 여러 서비스의 데이터를 조립하여 프론트에 최적화된 응답을 제공하는 패턴임.",
    category: "Architecture",
    icon: Link,
  },
  {
    id: 5,
    name: "Attachment-Service",
    value: 7,
    context:
      "프로필, 게시글 이미지 등 모든 첨부파일을 통합 관리하는 전용 서비스임.",
    category: "Service",
    icon: Database,
  },
  {
    id: 6,
    name: "카카오 OAuth2",
    value: 6,
    context:
      "소셜 로그인 및 신규 회원의 자동 가입/약관 동의 프로세스의 핵심임.",
    category: "Security",
    icon: UserCheck,
  },
  {
    id: 7,
    name: "UUID",
    value: 5,
    context:
      "MSA 환경에서 서비스 간 회원 식별을 위해 사용하는 불변의 고유 식별자임.",
    category: "Infra",
    icon: Settings,
  },
  {
    id: 8,
    name: "Docker Compose",
    value: 4,
    context:
      "각 마이크로서비스를 컨테이너화하여 로컬 및 배포 환경에서 일괄 실행함.",
    category: "DevOps",
    icon: Cloud,
  },
  {
    id: 9,
    name: "Refresh Token",
    value: 4,
    context:
      "Access Token 만료 시 보안을 유지하며 토큰을 재발급하는 갱신 메커니즘임.",
    category: "Security",
    icon: ShieldCheck,
  },
  {
    id: 10,
    name: "Cookie",
    value: 4,
    context:
      "JWT를 안전하게 저장하고 CSRF/XSS 공격을 방어하기 위한 저장 방식임.",
    category: "Security",
    icon: ShieldCheck,
  },
  {
    id: 11,
    name: "Redux",
    value: 3,
    context:
      "프론트엔드 전역에서 로그인 상태 및 프로필 정보를 관리하는 상태 관리 도구임.",
    category: "Frontend",
    icon: Settings,
  },
  {
    id: 12,
    name: "Cleanup-Service",
    value: 3,
    context:
      "DB 레코드와 실제 스토리지의 가비지 파일을 정리하는 배치 서비스임.",
    category: "Service",
    icon: Database,
  },
  {
    id: 13,
    name: "Soft Delete",
    value: 3,
    context:
      "회원 탈퇴 시 데이터를 즉시 삭제하지 않고 상태값 변경 후 유예 기간을 둠.",
    category: "Service",
    icon: Database,
  },
  {
    id: 14,
    name: "Post-Service",
    value: 3,
    context:
      "지식 공유 게시판 기능을 담당하며 카테고리, 댓글, 태그 기능을 포함함.",
    category: "Service",
    icon: Layers,
  },
  {
    id: 15,
    name: "MariaDB",
    value: 3,
    context: "서비스별로 독립적인 스키마를 가지는 데이터베이스 엔진임.",
    category: "Infra",
    icon: Database,
  },
  {
    id: 16,
    name: "Diary-Service",
    value: 3,
    context: "사용자의 감정 기록, 회고, GPT 기반 피드백 기능을 제공함.",
    category: "Service",
    icon: Layers,
  },
  {
    id: 17,
    name: "GPT (AI API)",
    value: 2,
    context: "회고 내용을 요약하거나 감정에 대한 피드백을 제공하는 AI 기능임.",
    category: "AI",
    icon: Cpu,
  },
  {
    id: 18,
    name: "Axios Interceptor",
    value: 2,
    context: "401/403 에러 발생 시 자동으로 토큰을 갱신하거나 리다이렉트함.",
    category: "Frontend",
    icon: Link,
  },
  {
    id: 19,
    name: "Nginx",
    value: 2,
    context: "리버스 프록시 및 도메인 기반 라우팅, SSL 적용을 위한 관문임.",
    category: "DevOps",
    icon: Cloud,
  },
  {
    id: 20,
    name: "AWS EC2",
    value: 1,
    context: "클라우드 환경에서 전체 MSA 서비스를 호스팅하는 최종 배포지임.",
    category: "DevOps",
    icon: Cloud,
  },
];
