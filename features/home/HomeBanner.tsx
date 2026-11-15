"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { BannerArt } from "@/components/illustrations/BannerArt";
import { colors } from "@/components/ui/theme";
import type { BannerSlide } from "@/features/home/home-menus";

const AUTOPLAY_MS = 5000;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 홈 배너 슬라이드 (Embla Carousel, MIT).
 * - 5초마다 넘어가며, 마우스를 올리거나 일시정지 버튼을 누르면 멈춘다(WCAG 2.2.2).
 * - '동작 줄이기' 설정 사용자는 자동 넘김을 끈다.
 * - 손가락으로 밀어서 넘기기, 좌우 화살표, 하단 점으로 이동할 수 있다.
 */
export function HomeBanner({ slides, onNavigate }: { slides: BannerSlide[]; onNavigate: (href: string) => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false, stopOnMouseEnter: true, playOnInit: !prefersReducedMotion() }),
  ]);
  const [selected, setSelected] = useState(0);
  // 실제 재생 상태는 캐러셀이 알려주는 이벤트로만 맞춘다(서버 렌더링 시점에는 사용자 설정을 알 수 없음)
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    const syncPlaying = () => setPlaying(Boolean(emblaApi.plugins().autoplay?.isPlaying()));
    emblaApi.on("select", onSelect).on("reInit", onSelect).on("autoplay:play", syncPlaying).on("autoplay:stop", syncPlaying);
    queueMicrotask(syncPlaying);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect).off("autoplay:play", syncPlaying).off("autoplay:stop", syncPlaying);
    };
  }, [emblaApi]);

  const togglePlay = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;
    if (!autoplay) return;
    if (autoplay.isPlaying()) autoplay.stop();
    else autoplay.play();
    setPlaying(autoplay.isPlaying());
  }, [emblaApi]);

  return (
    <section aria-roledescription="carousel" aria-label="공수잡 주요 안내" style={{ background: "linear-gradient(180deg, #e8effc 0%, #f4f7fd 100%)", borderBottom: `1px solid ${colors.line}` }}>
      <div className="gs-container" style={{ position: "relative", paddingBlock: "clamp(16px, 3vw, 28px)" }}>
        <div ref={emblaRef} style={{ overflow: "hidden", borderRadius: "var(--gs-radius-lg)" }}>
          <div style={{ display: "flex", touchAction: "pan-y pinch-zoom" }}>
            {slides.map((slide, index) => (
              <div
                key={slide.key}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${slides.length}`}
                aria-hidden={index !== selected}
                style={{ flex: "0 0 100%", minWidth: 0 }}
              >
                <div className="gs-banner-slide">
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: colors.brandText }}>{slide.eyebrow}</p>
                    <h2 className="gs-banner-title" style={{ margin: "0 0 10px", color: colors.ink, fontWeight: 800, whiteSpace: "pre-line" }}>
                      {slide.title}
                    </h2>
                    <p style={{ margin: "0 0 18px", fontSize: "clamp(13px, 0.3vw + 12px, 16px)", color: colors.sub }}>{slide.description}</p>
                    <button
                      type="button"
                      tabIndex={index === selected ? 0 : -1}
                      onClick={() => onNavigate(slide.href)}
                      style={{ minHeight: "44px", padding: "0 18px", borderRadius: "999px", border: "none", background: colors.navy, color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                    >
                      {slide.cta} →
                    </button>
                  </div>
                  <div className="gs-banner-art">
                    <BannerArt name={slide.art} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "12px" }}>
          <IconButton label="이전 배너" onClick={() => emblaApi?.scrollPrev()}>
            <ChevronLeft size={18} />
          </IconButton>
          <div role="tablist" aria-label="배너 선택" style={{ display: "flex", gap: "6px" }}>
            {slides.map((slide, index) => (
              <button
                key={slide.key}
                type="button"
                role="tab"
                aria-selected={index === selected}
                aria-label={`${index + 1}번 배너: ${slide.eyebrow}`}
                onClick={() => emblaApi?.scrollTo(index)}
                style={{ width: index === selected ? "22px" : "8px", height: "8px", borderRadius: "999px", border: "none", padding: 0, background: index === selected ? colors.navy : colors.blueBorder, cursor: "pointer", transition: "width 0.2s ease" }}
              />
            ))}
          </div>
          <IconButton label="다음 배너" onClick={() => emblaApi?.scrollNext()}>
            <ChevronRight size={18} />
          </IconButton>
          <IconButton label={playing ? "자동 넘김 멈춤" : "자동 넘김 재생"} onClick={togglePlay}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
        </div>
      </div>
    </section>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", border: `1px solid ${colors.blueBorder}`, background: "rgba(255,255,255,0.8)", color: colors.navy, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
