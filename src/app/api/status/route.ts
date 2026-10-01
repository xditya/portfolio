import { NextResponse } from "next/server";
import { services } from "@/content/services";

const maxDays = 30;

interface StatusData {
  [key: number]: number | null;
  upTime: string;
}

async function fetchStatusLog(key: string): Promise<StatusData | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/xditya/StatusPage/contents/logs/${key}_report.log`,
      {
        headers: {
          Accept: "application/vnd.github.raw",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Status log not found for ${key}`);
        return {
          upTime: "--%",
          ...Object.fromEntries(
            Array.from({ length: maxDays }, (_, i) => [i, null])
          ),
        };
      }
      throw new Error(
        `Failed to fetch status log for ${key}: ${response.statusText}`
      );
    }

    const statusLines = await response.text();
    return normalizeData(statusLines);
  } catch (error) {
    console.error(`Error fetching status for ${key}:`, error);
    return {
      upTime: "--%",
      ...Object.fromEntries(
        Array.from({ length: maxDays }, (_, i) => [i, null])
      ),
    };
  }
}

function normalizeData(statusLines: string): StatusData {
  const rows = statusLines.split("\n").filter((row) => row.trim() !== "");
  const dateValues = splitRowsByDate(rows);

  const relativeDateMap: {
    [key: number]: number | null;
    upTime: string;
  } = {
    upTime: dateValues.upTime as string,
  };

  const now = Date.now();

  for (let i = 0; i < maxDays; i++) {
    const targetDate = new Date(now - i * 24 * 60 * 60 * 1000);
    targetDate.setHours(0, 0, 0, 0);
    const dateStr = targetDate.toDateString();

    const dailyValues = dateValues.dailyData[dateStr];
    relativeDateMap[i] = getDayAverage(dailyValues);
  }

  return relativeDateMap;
}

interface DailyData {
  [key: string]: number[];
}

interface SplitData {
  dailyData: DailyData;
  upTime: string;
}

function splitRowsByDate(rows: string[]): SplitData {
  const dailyData: DailyData = {};
  let sum = 0;
  let count = 0;

  for (const row of rows) {
    const [dateTimeStr, resultStr] = row.split(",", 2);
    // Log timestamps are UTC without a zone suffix.
    const dateTime = new Date(dateTimeStr + " GMT");
    const dateStr = dateTime.toDateString();

    if (!dailyData[dateStr]) {
      dailyData[dateStr] = [];
    }

    const outcome = resultStr?.trim();
    const result = outcome === "success" ? 1 : 0;
    // Only verdicts count towards uptime; "failure" appears in older rows.
    if (outcome === "success" || outcome === "failed" || outcome === "failure") {
      sum += result;
      count++;
    }

    dailyData[dateStr].push(result);
  }

  const upTime = count > 0 ? ((sum / count) * 100).toFixed(2) + "%" : "--%";

  return { dailyData, upTime };
}

function getDayAverage(val: number[] | undefined): number | null {
  if (!val || val.length === 0) {
    return null;
  }
  const numericValues = val.filter((v) => typeof v === "number") as number[];
  if (numericValues.length === 0) return null;
  return numericValues.reduce((a, v) => a + v, 0) / numericValues.length;
}

export async function GET() {
  try {
    const statusData = await Promise.all(
      services.map(async (service) => {
        const data = await fetchStatusLog(service.key);
        return {
          key: service.key,
          url: service.url,
          data,
        };
      })
    );

    return NextResponse.json({ status: "success", data: statusData });
  } catch (error) {
    console.error("Error fetching status data in GET:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch status data" },
      { status: 500 }
    );
  }
}
