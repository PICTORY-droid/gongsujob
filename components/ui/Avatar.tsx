import { colors } from "@/components/ui/theme";

/**
 * 원형 프로필 이미지. 사진이 없으면 이니셜 표시.
 * 사용자 업로드 이미지(외부 스토리지 URL)라서 next/image 대신 img를 쓴다.
 */
export function Avatar({ src, fallback, size = 48, fontSize = 20, alt = "프로필" }: { src?: string | null; fallback: string; size?: number; fontSize?: number; alt?: string }) {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: "50%", background: src ? "transparent" : colors.brand, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: `${fontSize}px`, color: "var(--gs-surface)", fontWeight: 700 }}>{fallback}</span>
      )}
    </div>
  );
}
