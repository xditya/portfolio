import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  hcaptchaToken: z.string().min(1, "Captcha token is required"),
});

function getClientIP(headersList: Headers): string {
  // Try different headers in order of preference
  const headersToCheck = [
    "x-real-ip",
    "x-forwarded-for",
    "cf-connecting-ip", // Cloudflare
    "true-client-ip", // Akamai and Cloudflare
    "x-client-ip",
  ];

  for (const header of headersToCheck) {
    const value = headersList.get(header);
    if (value) {
      // Handle comma-separated IPs (take the first one)
      const ip = value.split(",")[0].trim();
      // Remove IPv6 prefix if present
      return ip.replace(/^::ffff:/, "");
    }
  }

  return "Unknown";
}

async function getLocationInfo(ip: string) {
  // Skip lookup for local IPs
  if (ip === "127.0.0.1" || ip === "localhost" || ip === "Unknown") {
    return {
      country: "Local Development",
      city: "Local",
      region: "Local",
      isp: "Local",
    };
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      throw new Error("Location lookup failed");
    }
    const data = await response.json();

    // Check if we got valid data
    if (!data.country_name || !data.city) {
      throw new Error("Invalid location data");
    }

    return {
      country: data.country_name,
      city: data.city,
      region: data.region || "Unknown",
      isp: data.org || "Unknown",
    };
  } catch (error) {
    console.error("Location lookup error:", error);
    return {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
      isp: "Unknown",
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const locationInfo = await getLocationInfo(ip);

    let validatedData;
    try {
      validatedData = contactSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return NextResponse.json(
          {
            error: "Validation failed",
            details: errorMessages,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Verify hCaptcha token
    const hcaptchaResponse = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: validatedData.hcaptchaToken,
      }),
    });

    const hcaptchaData = await hcaptchaResponse.json();

    if (!hcaptchaData.success) {
      return NextResponse.json({ error: "Invalid captcha" }, { status: 400 });
    }

    // Format message with HTML
    const telegramMessage = `
<b>📨 New Contact Form Submission</b>

<b>👤 From:</b>
• Name: <code>${validatedData.name}</code>
• Email: <code>${validatedData.email}</code>
• Phone: <code>${validatedData.phone || "Not provided"}</code>

<b>📝 Message:</b>
<code>${validatedData.message}</code>

<b>🌍 Location Info:</b>
• IP: <code>${ip}</code>
• Location: <code>${locationInfo.city}, ${locationInfo.region}, ${
      locationInfo.country
    }</code>
• ISP: <code>${locationInfo.isp}</code>`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      }
    );

    if (!telegramResponse.ok) {
      throw new Error("Failed to send message to Telegram");
    }

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
