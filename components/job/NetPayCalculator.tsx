"use client";

import { useState } from "react";
import { calculateNetPay, clampDays } from "@/domain/net-pay";

type NetPayCalculatorProps = {
  dailyPay: number;
};

/** 일당 기준 실수령액 계산기 (계산 로직은 domain/net-pay.ts) */
export default function NetPayCalculator({ dailyPay }: NetPayCalculatorProps) {
  const [calcDays, setCalcDays] = useState(1);
  const [showCalc, setShowCalc] = useState(false);
  const [includePensionHealth, setIncludePensionHealth] = useState(false);

  const calc = calculateNetPay(dailyPay, calcDays, includePensionHealth);

  return (
    <div style={{ background: "#fff", borderRadius: "16px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <button type="button" aria-expanded={showCalc} onClick={() => setShowCalc(v => !v)} style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>실수령액 계산기</span>
        <span style={{ fontSize: "11px", color: "#FF6B00" }}>{showCalc ? "접기" : "열기"}</span>
      </button>

      {showCalc && calc && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f5f5f5" }}>
          <div style={{ marginTop: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "13px", color: "#666" }}>일당 {Number(dailyPay).toLocaleString()}원 x</span>
              <button type="button" aria-label="근무일 줄이기" onClick={() => setCalcDays((d) => clampDays(d - 1))} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #ddd", background: "#fff", fontSize: "18px", cursor: "pointer" }}>-</button>
              <span style={{ fontSize: "18px", fontWeight: 700, minWidth: "32px", textAlign: "center" }}>{calcDays}</span>
              <button type="button" aria-label="근무일 늘리기" onClick={() => setCalcDays((d) => clampDays(d + 1))} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #ddd", background: "#fff", fontSize: "18px", cursor: "pointer" }}>+</button>
              <span style={{ fontSize: "13px", color: "#666" }}>일</span>
            </div>

            <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "14px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px", padding: "10px", background: "#fff", border: "1px solid #eee", borderRadius: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={includePensionHealth}
                  onChange={(e) => setIncludePensionHealth(e.target.checked)}
                  style={{ marginTop: "3px" }}
                />
                <span>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>국민연금·건강보험 적용</span>
                  <span style={{ display: "block", fontSize: "11px", color: "#999", lineHeight: 1.5, marginTop: "2px" }}>1개월 이상 또는 월 8일 이상 근무 예정일 때 체크</span>
                </span>
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>총 일당</span>
                <span>{calc.total.toLocaleString()}원</span>
              </div>

              {includePensionHealth && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#666" }}>국민연금 (4.75%)</span>
                    <span style={{ color: "#e53e3e" }}>- {calc.nationalPension.toLocaleString()}원</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#666" }}>건강보험 (3.595%)</span>
                    <span style={{ color: "#e53e3e" }}>- {calc.healthInsurance.toLocaleString()}원</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#666" }}>장기요양보험</span>
                    <span style={{ color: "#e53e3e" }}>- {calc.longTermCare.toLocaleString()}원</span>
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>고용보험 (0.9%)</span>
                <span style={{ color: "#e53e3e" }}>- {calc.employment.toLocaleString()}원</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>소득세</span>
                <span style={{ color: "#e53e3e" }}>- {calc.incomeTax.toLocaleString()}원</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#666" }}>지방소득세</span>
                <span style={{ color: "#e53e3e" }}>- {calc.localIncomeTax.toLocaleString()}원</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "13px", color: "#666", fontWeight: 700 }}>총 공제액</span>
                <span style={{ color: "#e53e3e", fontWeight: 700 }}>- {calc.totalDeduction.toLocaleString()}원</span>
              </div>

              <div style={{ borderTop: "1px solid #ddd", marginTop: "10px", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700 }}>예상 실수령액</span>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#FF6B00" }}>{calc.net.toLocaleString()}원</span>
              </div>

              <div style={{ fontSize: "11px", color: "#999", lineHeight: 1.5, marginTop: "10px" }}>
                산재보험은 사업주 부담 항목이라 실수령액 공제에 포함하지 않았습니다. 국민연금과 건강보험은 근무 기간과 월 근무일수 조건에 따라 적용 여부가 달라질 수 있습니다. 개인마다 상이할 수 있습니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
