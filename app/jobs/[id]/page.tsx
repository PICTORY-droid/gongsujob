"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const [job, setJob] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [calcDays, setCalcDays] = useState(1);
  const [showCalc, setShowCalc] = useState(false);
  const [mapCoords, setMapCoords] = useState<{lat: string; lng: string} | null>(null);

  useEffect(() => {
    const init = async () => {
      const res2 = await supabase.auth.getUser();
      const user = res2.data.user;
      if (!user) { window.location.href = "/login"; return; }
      setUser(user);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profile);
      const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
      setJob(job);
      setLoading(false);
      const { data: app } = await supabase.from("applications").select("id").eq("job_id", jobId).eq("user_id", user.id).maybeSingle();
      if (app) setApplied(true);
      if (job?.region) {
        setWeatherLoading(true);
        try {
          const res = await fetch("/api/weather?region=" + encodeURIComponent(job.region));
          const data = await res.json();
          if (!data.error) setWeather(data);
        } catch {}
        setWeatherLoading(false);
      }
      const address = job?.detail_address || job?.region;
      if (address) {
        try {
          const geoRes = await fetch("/api/geocode?address=" + encodeURIComponent(address));
          const geoData = await geoRes.json();
          if (!geoData.error) setMapCoords(geoData);
        } catch {}
      }
    };
    if (jobId) init();
  }, [jobId]);

  const handleApply = async () => {
    if (applied) return;
    setApplying(true);
    const { error } = await supabase.from("applications").insert({ job_id: jobId, user_id: user.id, status: "지원완료" });
    if (!error) { setApplied(true); setMessage("지원 완료!"); }
    else { setMessage("오류 발생."); }
    setApplying(false);
  };

  const calcResult = () => {
    if (!job?.pay) return null;
    const daily = Number(job.pay);
    const total = daily * calcDays;
    const employment = Math.floor(total * 0.009);
    const incomeTax = daily > 150000 ? Math.floor((daily - 150000) * 0.06 * 0.55) * calcDays : 0;
    return { total, employment, incomeTax, net: total - employment - incomeTax };
  };

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#999"}}>불러오는 중...</div></div>;
  if (!job) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#999"}}>공고를 찾을 수 없습니다.</div></div>;

  const calc = calcResult();
  const isEmployer = profile?.user_type === "구인자";
  const address = job.detail_address || job.region;
  const staticMapUrl = mapCoords
    ? `https://dapi.kakao.com/v2/maps/staticmap?appkey=df58203831b3eac3cf6f8b301680d626&center=${mapCoords.lng},${mapCoords.lat}&level=4&w=560&h=220&marker=pos:${mapCoords.lng} ${mapCoords.lat}`
    : null;

  return (
    <div style={{minHeight:"100vh",background:"#f8f9fa",paddingBottom:"120px"}}>
      <header style={{background:"#fff",borderBottom:"1px solid #eee",padding:"0 20px",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <Link href="/jobs" style={{fontSize:"13px",color:"#666",textDecoration:"none"}}>← 공고목록</Link>
        <Link href="/" style={{display:"flex",alignItems:"center",gap:"6px",textDecoration:"none"}}>
          <img src="/logo.png" alt="로고" style={{width:"28px",height:"28px",borderRadius:"6px",objectFit:"cover"}} />
          <span style={{fontSize:"16px",fontWeight:700,color:"#1a1a1a"}}>현장공수잡</span>
        </Link>
        <div style={{width:"60px"}} />
      </header>

      <div style={{maxWidth:"600px",margin:"0 auto",padding:"16px 20px"}}>
        <div style={{background:"#fff",borderRadius:"16px",padding:"20px",marginBottom:"12px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
            <div style={{flex:1,marginRight:"12px"}}>
              <div style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
                {job.is_urgent && <span style={{background:"#FF6B00",color:"#fff",fontSize:"11px",borderRadius:"4px",padding:"3px 8px",fontWeight:700}}>긴급</span>}
                <span style={{background:"#fff3e0",color:"#FF6B00",fontSize:"11px",borderRadius:"4px",padding:"3px 8px",fontWeight:600}}>{job.job_type}</span>
              </div>
              <h1 style={{fontSize:"20px",fontWeight:700,color:"#1a1a1a",margin:0,lineHeight:1.3}}>{job.title}</h1>
              <div style={{fontSize:"13px",color:"#999",marginTop:"4px"}}>{job.company}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:"22px",fontWeight:800,color:"#FF6B00"}}>{Number(job.pay).toLocaleString()}원</div>
              <div style={{fontSize:"12px",color:"#999"}}>/{job.pay_type}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {[
              {label:"현장 위치", value: address},
              {label:"시작일", value: job.start_date},
              {label:"직종", value: job.job_type},
              {label:"모집 인원", value: job.headcount ? job.headcount + "명" : null},
            ].filter(i => i.value).map((item, idx) => (
              <div key={idx} style={{display:"flex",gap:"8px"}}>
                <span style={{fontSize:"13px",color:"#999",minWidth:"90px"}}>{item.label}</span>
                <span style={{fontSize:"13px",color:"#1a1a1a",fontWeight:500}}>{item.value}</span>
              </div>
            ))}
          </div>
          {job.description && (
            <div style={{marginTop:"16px",padding:"14px",background:"#f8f9fa",borderRadius:"10px"}}>
              <div style={{fontSize:"12px",color:"#999",marginBottom:"6px",fontWeight:600}}>공고 내용</div>
              <div style={{fontSize:"14px",color:"#333",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{job.description}</div>
            </div>
          )}
        </div>

        <div style={{background:"#fff",borderRadius:"16px",padding:"16px 20px",marginBottom:"12px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:"13px",fontWeight:700,color:"#1a1a1a",marginBottom:"12px"}}>현장 위치 지도</div>
          <a href={"https://map.kakao.com/?q=" + encodeURIComponent(address)} target="_blank" rel="noreferrer" style={{display:"block",borderRadius:"10px",overflow:"hidden"}}>
            {staticMapUrl ? (
              <img src={staticMapUrl} style={{width:"100%",height:"220px",objectFit:"cover",display:"block"}} alt="지도" />
            ) : (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"180px",background:"#fff3e0",border:"1.5px solid #FF6B00",borderRadius:"10px"}}>
                <span style={{fontSize:"36px",marginBottom:"8px"}}>🗺️</span>
                <span style={{fontSize:"14px",fontWeight:700,color:"#FF6B00"}}>카카오맵에서 보기</span>
                <span style={{fontSize:"12px",color:"#999",marginTop:"4px"}}>{address}</span>
              </div>
            )}
          </a>
          <div style={{fontSize:"12px",color:"#999",marginTop:"8px"}}>{address}</div>
        </div>

        <div style={{background:"#fff",borderRadius:"16px",padding:"16px 20px",marginBottom:"12px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{fontSize:"13px",fontWeight:700,color:"#1a1a1a",marginBottom:"12px"}}>현장 날씨 ({job.region})</div>
          {weatherLoading ? (
            <div style={{fontSize:"13px",color:"#999"}}>날씨 불러오는 중...</div>
          ) : weather ? (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px"}}>
                <span style={{fontSize:"36px"}}>{weather.icon}</span>
                <div>
                  <div style={{fontSize:"18px",fontWeight:700}}>{weather.weather}</div>
                  {weather.temperature && <div style={{fontSize:"13px",color:"#666"}}>현재 {weather.temperature}</div>}
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  {weather.rainProb && <div style={{fontSize:"12px",color:"#0ea5e9"}}>강수확률 {weather.rainProb}</div>}
                  {weather.tempMin && <div style={{fontSize:"12px",color:"#666"}}>최저 {weather.tempMin} / 최고 {weather.tempMax}</div>}
                </div>
              </div>
              <div style={{padding:"10px 14px",borderRadius:"10px",background:weather.workable?"#f0fff4":"#fff5f5",border:"1px solid "+(weather.workable?"#9ae6b4":"#fed7d7"),display:"flex",alignItems:"center",gap:"8px"}}>
                <span>{weather.workable ? "✅" : "⚠️"}</span>
                <span style={{fontSize:"13px",fontWeight:600,color:weather.workable?"#276749":"#c53030"}}>
                  {weather.workable ? "오늘 작업 가능 날씨" : "비/눈 — 소장님께 확인하세요"}
                </span>
              </div>
            </div>
          ) : (
            <div style={{fontSize:"13px",color:"#999"}}>날씨 정보를 불러올 수 없습니다.</div>
          )}
        </div>

        <div style={{background:"#fff",borderRadius:"16px",marginBottom:"12px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflow:"hidden"}}>
          <button onClick={() => setShowCalc(v => !v)} style={{width:"100%",padding:"16px 20px",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"13px",fontWeight:700,color:"#1a1a1a"}}>실수령액 계산기</span>
            <span style={{fontSize:"11px",color:"#FF6B00"}}>{showCalc ? "접기" : "열기"}</span>
          </button>
          {showCalc && calc && (
            <div style={{padding:"0 20px 20px",borderTop:"1px solid #f5f5f5"}}>
              <div style={{marginTop:"14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
                  <span style={{fontSize:"13px",color:"#666"}}>일당 {Number(job.pay).toLocaleString()}원 x</span>
                  <button onClick={() => setCalcDays(d => Math.max(1, d - 1))} style={{width:"30px",height:"30px",borderRadius:"50%",border:"1px solid #ddd",background:"#fff",fontSize:"18px",cursor:"pointer"}}>-</button>
                  <span style={{fontSize:"18px",fontWeight:700,minWidth:"32px",textAlign:"center"}}>{calcDays}</span>
                  <button onClick={() => setCalcDays(d => Math.min(31, d + 1))} style={{width:"30px",height:"30px",borderRadius:"50%",border:"1px solid #ddd",background:"#fff",fontSize:"18px",cursor:"pointer"}}>+</button>
                  <span style={{fontSize:"13px",color:"#666"}}>일</span>
                </div>
                <div style={{background:"#f8f9fa",borderRadius:"12px",padding:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"13px",color:"#666"}}>총 일당</span><span>{calc.total.toLocaleString()}원</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"13px",color:"#666"}}>고용보험 (0.9%)</span><span style={{color:"#e53e3e"}}>- {calc.employment.toLocaleString()}원</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><span style={{fontSize:"13px",color:"#666"}}>소득세</span><span style={{color:"#e53e3e"}}>- {calc.incomeTax.toLocaleString()}원</span></div>
                  <div style={{borderTop:"1px solid #ddd",marginTop:"10px",paddingTop:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"14px",fontWeight:700}}>예상 실수령액</span>
                    <span style={{fontSize:"20px",fontWeight:800,color:"#FF6B00"}}>{calc.net.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isEmployer && (
        <div style={{position:"fixed",bottom:"64px",left:0,right:0,background:"#fff",borderTop:"1px solid #eee",padding:"12px 20px",zIndex:90}}>
          {message && <div style={{textAlign:"center",fontSize:"13px",color:"#276749",marginBottom:"8px",fontWeight:600}}>{message}</div>}
          <button onClick={handleApply} disabled={applied || applying} style={{width:"100%",maxWidth:"560px",display:"block",margin:"0 auto",padding:"14px",borderRadius:"12px",border:"none",fontSize:"16px",fontWeight:700,background:applied?"#e2e8f0":"#FF6B00",color:applied?"#999":"#fff",cursor:applied?"default":"pointer"}}>
            {applying ? "지원 중.." : applied ? "이미 지원한 공고" : "지원하기"}
          </button>
        </div>
      )}

      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #eee",display:"flex",padding:"8px 0",zIndex:80}}>
        {[{icon:"🏠",label:"홈",href:"/"},{icon:"📋",label:"공고",href:"/jobs"},{icon:"👷",label:"인재",href:"/resumes"},{icon:"📝",label:"이력서",href:"/resume/write"},{icon:"👤",label:"내정보",href:"/mypage"}].map((tab, i) => (
          <Link key={i} href={tab.href} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",textDecoration:"none"}}>
            <span style={{fontSize:"20px"}}>{tab.icon}</span>
            <span style={{fontSize:"10px",color:i===1?"#FF6B00":"#999",fontWeight:i===1?600:400}}>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}