"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/components/MobileBottomNav";
import AppHeader from "@/components/AppHeader";
import JobCard from "@/components/JobCard";

const JOB_CATEGORIES = ["전체", "철근", "형틀", "방수", "도장", "미장", "전기", "배관", "용접", "타일", "조적", "기타"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      fetchJobs();
    };
    checkAndFetch();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("active_jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (selectedCategory !== "전체") {
      query = query.eq("job_type", selectedCategory);
    }
    const { data, error } = await query;
    if (!error && data) setJobs(data);
    setLoading(false);
  };

  const filtered = jobs.filter(job =>
    job.title?.includes(searchQuery) || job.region?.includes(searchQuery)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Apple SD Gothic Neo', sans-serif", paddingBottom: "80px" }}>
      <AppHeader backHref="/" backLabel="← 홈" rightSpace={40} />

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="직종 또는 지역 검색"
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "1px solid #eee" }}>
        <div style={{ position: "relative" }}>
          <button onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", border: "1.5px solid #FF6B00", borderRadius: "10px", background: "#fff", fontSize: "14px", fontWeight: 600, color: "#FF6B00", cursor: "pointer" }}>
            {selectedCategory === "전체" ? "직종 선택" : selectedCategory}
            <span style={{ fontSize: "11px" }}>{dropdownOpen ? "▲" : "▼"}</span>
          </button>
          {dropdownOpen && (
            <div style={{ position: "absolute", top: "44px", left: 0, background: "#fff", border: "1px solid #eee", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 50, minWidth: "160px", overflow: "hidden" }}>
              {JOB_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "11px 18px", border: "none", background: selectedCategory === cat ? "#fff8f5" : "#fff", fontSize: "14px", fontWeight: selectedCategory === cat ? 700 : 400, color: selectedCategory === cat ? "#FF6B00" : "#333", cursor: "pointer", textAlign: "left" }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999", fontSize: "14px" }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <div style={{ fontSize: "15px", color: "#999" }}>등록된 공고가 없습니다</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
