"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoRefreshOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Footer from "@/components/Footer";

interface StatusData {
  key: string;
  url: string;
  data: {
    [key: string]: number | null;
    upTime: number | null;
  } | null;
}

const getStatusColor = (uptimeVal: number | null | undefined) => {
  if (uptimeVal === null || uptimeVal === undefined) return "nodata";
  if (uptimeVal === 1) return "success";
  if (uptimeVal < 0.3) return "failure";
  return "partial";
};

const getStatusText = (color: string) => {
  switch (color) {
    case "nodata":
      return "No Data Available";
    case "success":
      return "Fully Operational";
    case "failure":
      return "Major Outage";
    case "partial":
      return "Partial Outage";
    default:
      return "Unknown";
  }
};

const StatusPage = () => {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const loadingIconRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Title animation
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }
      );
    }

    // Fetch status data
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        if (data.status === "success") {
          setStatusData(data.data);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    // Loading animation
    if (loading && loadingIconRef.current) {
      gsap.to(loadingIconRef.current, {
        rotation: 360,
        duration: 1,
        repeat: -1,
        ease: "linear",
      });
    } else if (!loading && loadingIconRef.current) {
      gsap.killTweensOf(loadingIconRef.current);
      gsap.set(loadingIconRef.current, { rotation: 0 });
    }
  }, [loading]);

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-20">
        <div className="max-w-4xl mx-auto relative">
          <div className="mb-12">
            <button
              onClick={handleBack}
              className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--primary)]/10 mb-4 flex items-center gap-2"
              aria-label="Go back"
            >
              <IoArrowBack className="text-xl" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary)] text-center"
            >
              Website Status
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div
                ref={loadingIconRef}
                className="text-[var(--accent)] text-5xl flex justify-center items-center opacity-80"
              >
                <IoRefreshOutline />
              </div>
              <p className="mt-4 text-[var(--foreground)]/60 font-medium">Fetching status...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {statusData.map((service, index) => (
                <div
                  key={service.key}
                  className="bg-[var(--foreground)]/5 border border-[var(--primary)]/10 rounded-2xl p-6 transition-all duration-300 hover:border-[var(--primary)]/30 hover:bg-[var(--foreground)]/8 hover:scale-[1.01] hover:shadow-lg hover:shadow-[var(--primary)]/5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--primary)] mb-1">
                        {service.key.charAt(0).toUpperCase() +
                          service.key.slice(1)}
                      </h2>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--foreground)]/50 hover:text-[var(--accent)] transition-colors duration-200 text-sm flex items-center gap-1"
                      >
                        {service.url}
                      </a>
                    </div>
                    {service.data && (
                      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                         <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${
                            getStatusColor(service.data[0]) === "success"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : getStatusColor(service.data[0]) === "failure"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : getStatusColor(service.data[0]) === "partial"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-[var(--foreground)]/10 text-[var(--foreground)]/60 border-[var(--foreground)]/20"
                          }`}
                        >
                           <span className={`w-2 h-2 rounded-full ${
                             getStatusColor(service.data[0]) === "success" ? "bg-emerald-400" :
                             getStatusColor(service.data[0]) === "failure" ? "bg-red-400" :
                             getStatusColor(service.data[0]) === "partial" ? "bg-amber-400" : "bg-[var(--foreground)]/40"
                           }`}></span>
                          {getStatusText(getStatusColor(service.data[0]))}
                        </div>
                        <div className="text-[var(--foreground)]/40 text-xs font-mono">
                          Uptime: {service.data.upTime}%
                        </div>
                      </div>
                    )}
                  </div>

                  {service.data && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-[var(--foreground)]/40 px-1">
                            <span>30 days ago</span>
                            <span>Today</span>
                        </div>
                        <div className="grid grid-cols-[repeat(30,1fr)] gap-1">
                        {Array.from({ length: 30 }, (_, i) => {
                            // Reverse index to show latest on right (assuming data is [latest, ..., oldest] which is typical, actually usually typical is [oldest, ..., latest] for charts but let's assume index 0 is latest based on getStatusColor(service.data[0]) usage above. 
                            // Wait, getStatusColor(service.data[0]) checks the first item. Usually API returns 0 as latest or 0 as oldest. 
                            // Based on typical status pages, right is today. 
                            // If index 0 is used for current status text, then index 0 is likely "today".
                            // So we should map straightforwardly if we want left-to-right to be old-to-new, we need to reverse the array or handle indices.
                            // The original code used: `getStatusColor(service.data?.[i])` where i goes 0 to 29.
                            // And displayed tooltip `Date.now() - i * 24...`. So i=0 is today, i=1 is yesterday.
                            // If we render left-to-right as 0..29, then 0 (today) is on the left? That's counter-intuitive for a timeline.
                            // Timelines usually go Old -> New (Left -> Right).
                            // So we should probably render index 29 (oldest) to index 0 (newest).
                            
                            const dayIndex = 29 - i; // 29, 28, ... 0.
                            const status = service.data?.[dayIndex]; // Get data from oldest to newest
                            const color = getStatusColor(status);
                            
                            // Re-calculating date for tooltip based on the actual data index
                            const date = new Date(Date.now() - dayIndex * 24 * 60 * 60 * 1000);

                            return (
                            <div
                                key={i}
                                className={`aspect-[1/2] sm:aspect-square rounded-sm transition-all duration-300 hover:scale-125 hover:z-10 cursor-help ${
                                color === "success"
                                    ? "bg-emerald-500/80 hover:bg-emerald-400"
                                    : color === "failure"
                                    ? "bg-red-500/80 hover:bg-red-400"
                                    : color === "partial"
                                    ? "bg-amber-500/80 hover:bg-amber-400"
                                    : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"
                                }`}
                                title={`${date.toLocaleDateString()}: ${getStatusText(color)}`}
                            />
                            );
                        })}
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default StatusPage;
