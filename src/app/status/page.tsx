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
          <div className="flex items-center mb-12">
            <button
              onClick={() => router.back()}
              className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors duration-200 absolute left-0"
              aria-label="Go back"
            >
              <IoArrowBack className="text-3xl" />
            </button>
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary)] text-center w-full"
            >
              Website Status
            </h1>
          </div>

          {loading ? (
            <div className="text-center">
              <div
                ref={loadingIconRef}
                className="text-[var(--primary)] text-5xl flex justify-center items-center"
              >
                <IoRefreshOutline />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {statusData.map((service) => (
                <div
                  key={service.key}
                  className="border border-[var(--foreground)]/20 rounded-lg p-6 hover:border-[var(--primary)]/50 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--primary)]">
                        {service.key.charAt(0).toUpperCase() +
                          service.key.slice(1)}
                      </h2>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--foreground)]/70 hover:text-[var(--primary)] transition-colors duration-200"
                      >
                        {service.url}
                      </a>
                    </div>
                    {service.data && (
                      <div className="text-right">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            getStatusColor(service.data[0]) === "success"
                              ? "bg-green-500/20 text-green-500"
                              : getStatusColor(service.data[0]) === "failure"
                              ? "bg-red-500/20 text-red-500"
                              : getStatusColor(service.data[0]) === "partial"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {getStatusText(getStatusColor(service.data[0]))}
                        </div>
                        <div className="text-[var(--foreground)]/70 mt-1">
                          Uptime: {service.data.upTime}
                        </div>
                      </div>
                    )}
                  </div>

                  {service.data && (
                    <div className="grid grid-cols-30 gap-1 mt-4">
                      {Array.from({ length: 30 }, (_, i) => {
                        const status = service.data?.[i];
                        const color = getStatusColor(status);
                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded-sm ${
                              color === "success"
                                ? "bg-green-500"
                                : color === "failure"
                                ? "bg-red-500"
                                : color === "partial"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                            }`}
                            title={`${new Date(
                              Date.now() - i * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}: ${getStatusText(color)}`}
                          />
                        );
                      })}
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
