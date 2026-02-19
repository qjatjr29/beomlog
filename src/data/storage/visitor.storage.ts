import { supabase } from "@/lib/supabase";
import { VisitorStats } from "@/shared/types";
import { hashIpString } from "@/shared/utils/ip.utils";

export const getVisitorStats = async (): Promise<VisitorStats> => {
  const today = new Date().toISOString().split("T")[0];

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
  const today = new Date().toISOString().split("T")[0];
  const lastVisit = localStorage.getItem("lastVisit");
  const cachedStats = localStorage.getItem("visitorStatsCache");

  if (lastVisit === today && cachedStats) {
    return JSON.parse(cachedStats) as VisitorStats;
  }

  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipResponse.json();
    const ipHash = await hashIpString(ip);

    const { data, error } = await supabase.rpc("record_visitor", {
      p_ip_hash: ipHash,
    });

    if (error) throw error;

    const stats: VisitorStats = {
      total: data.total,
      today: data.today,
    };

    // 성공 시 날짜 + stats 모두 캐싱
    localStorage.setItem("lastVisit", today);
    localStorage.setItem("visitorStatsCache", JSON.stringify(stats));

    return stats;
  } catch (error) {
    console.error("방문자 기록 실패:", error);
    return getVisitorStats();
  }
};
