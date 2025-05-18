import { NextResponse } from "next/server";

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
        // Cache data for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      // If the file doesn't exist, return null data
      if (response.status === 404) {
        console.warn(`Status log not found for ${key}`);
        return {
          upTime: "--%",
          // Initialize 30 days with null data
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
    // Return null data on error
    return {
      upTime: "--%",
      ...Object.fromEntries(
        Array.from({ length: maxDays }, (_, i) => [i, null])
      ),
    };
  }
}

function normalizeData(statusLines: string): StatusData {
  const rows = statusLines.split("\n").filter((row) => row.trim() !== ""); // Filter out empty rows
  const dateValues = splitRowsByDate(rows);

  const relativeDateMap: {
    [key: number]: number | null;
    upTime: string;
  } = {
    upTime: dateValues.upTime as string, // upTime is already a string from splitRowsByDate
  };

  const now = Date.now();

  // Ensure we cover the last maxDays days, even if no data exists
  for (let i = 0; i < maxDays; i++) {
    const targetDate = new Date(now - i * 24 * 60 * 60 * 1000);
    targetDate.setHours(0, 0, 0, 0); // Normalize to start of day
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
    // Use a more robust date parsing approach or ensure the input format is consistent
    // This assumes 'YYYY-MM-DD HH:mm:ss Z' or similar parseable format
    const dateTime = new Date(dateTimeStr + " GMT"); // Append GMT to treat as UTC
    const dateStr = dateTime.toDateString();

    if (!dailyData[dateStr]) {
      dailyData[dateStr] = [];
    }

    let result = 0;
    if (resultStr && resultStr.trim() === "success") {
      result = 1;
    }
    // Only count successful/failed results for overall uptime
    if (
      resultStr &&
      (resultStr.trim() === "success" || resultStr.trim() === "failure")
    ) {
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
  // Ensure all values are numbers before reducing
  const numericValues = val.filter((v) => typeof v === "number") as number[];
  if (numericValues.length === 0) return null;
  return numericValues.reduce((a, v) => a + v, 0) / numericValues.length;
}

export async function GET() {
  try {
    const services = [
      {
        key: "website",
        url: "https://xditya.me",
      },
      {
        key: "apis",
        url: "https://apis.xditya.me",
      },
      {
        key: "pastebin",
        url: "https://paste.xditya.me",
      },
      {
        key: "shortener",
        url: "https://short.xditya.me",
      },
      {
        key: "ultroid_docs",
        url: "https://ultroid.tech",
      },
      {
        key: "ultroid_bans",
        url: "https://bans.ultroid.tech",
      },
      {
        key: "ultroid_shortener",
        url: "https://tiny.ultroid.tech",
      },
    ];

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
