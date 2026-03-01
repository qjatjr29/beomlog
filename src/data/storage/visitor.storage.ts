import { supabase } from "@/lib/supabase";
import { VisitorStats } from "@/shared/types";
import { getKSTDateString } from "@/shared/utils";
import { hashIpString } from "@/shared/utils/ip.utils";

export const getVisitorStats = async (): Promise<VisitorStats> => {
  const today = getKSTDateString();

  const [{ data: statsData }, { data: dailyData }] = await Promise.all([
    supabase.from("visitor_stats").select("total").eq("id", 1).single(),
    supabase.from("visitor_daily").select("count").eq("date", today).single(),
  ]);

  return {
    total: statsData?.total ?? 0,
    today: dailyData?.count ?? 0,
  };
};

export const incrementVisitor = async (): Promise<VisitorStats> => {
  const today = getKSTDateString();
  const lastVisitDate = localStorage.getItem("lastVisitDate");
  const cachedStats = localStorage.getItem("visitorStatsCache");

  // 같은 날(KST 기준)이면 캐시 반환
  if (lastVisitDate === today && cachedStats) {
    return JSON.parse(cachedStats) as VisitorStats;
  }

  // 날짜가 바뀌었으면 캐시 무효화
  if (lastVisitDate !== today) {
    localStorage.removeItem("lastVisitDate");
    localStorage.removeItem("visitorStatsCache");
  }

  try {
    // IP 가져오기 - timeout 3초
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    let ipHash: string;
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json", {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const { ip } = await ipResponse.json();
      ipHash = await hashIpString(ip);
    } catch {
      clearTimeout(timeout);
      // IP 가져오기 실패 시 랜덤 fallback (같은 세션은 동일하게)
      const sessionKey =
        sessionStorage.getItem("sessionId") ?? crypto.randomUUID();
      sessionStorage.setItem("sessionId", sessionKey);
      ipHash = await hashIpString(sessionKey);
    }

    const { data, error } = await supabase.rpc("record_visitor", {
      p_ip_hash: ipHash,
    });

    if (error) throw error;

    const stats: VisitorStats = {
      total: data.total,
      today: data.today,
    };

    localStorage.setItem("lastVisitDate", today);
    localStorage.setItem("visitorStatsCache", JSON.stringify(stats));

    return stats;
  } catch (error) {
    console.error("방문자 기록 실패:", error);
    return getVisitorStats();
  }
};
