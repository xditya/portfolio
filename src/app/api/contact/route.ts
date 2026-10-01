import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  socialHandle: z.string().optional(),
  hcaptchaToken: z.string().min(1, "Captcha token is required"),
});

// Telegram rejects HTML-mode messages containing a raw "<" or "&".
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getClientIP(headersList: Headers): string {
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
      const ip = value.split(",")[0].trim();
      // Strip the IPv4-mapped IPv6 prefix.
      return ip.replace(/^::ffff:/, "");
    }
  }

  return "Unknown";
}

async function getLocationInfo(ip: string) {
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

    // Every interpolated value is untrusted, so all of it is escaped.
    const e = escapeHtml;
    const telegramMessage = `
<b>📨 New Contact Form Submission</b>

<b>👤 From:</b>
• Name: <code>${e(validatedData.name)}</code>
• Email: <code>${e(validatedData.email)}</code>
• Phone: <code>${e(validatedData.phone || "Not provided")}</code>
• Social: <code>${e(validatedData.socialHandle || "Not provided")}</code>

<b>📝 Message:</b>
<code>${e(validatedData.message)}</code>

<b>🌍 Location Info:</b>
• IP: <code>${e(ip)}</code>
• Location: <code>${e(`${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country}`)}</code>
• ISP: <code>${e(locationInfo.isp)}</code>`;

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
