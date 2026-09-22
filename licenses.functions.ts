import { createHash } from "crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const activationSchema = z.object({
  mentorId: z.string().trim().min(2).max(64),
  email: z.string().trim().email().max(254),
  license: z.string().trim().regex(/^TV-[A-Z0-9]{4,20}$/i),
  deviceId: z.string().trim().min(12).max(128),
});

export const activateLicense = createServerFn({ method: "POST" })
  .validator((input) => activationSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const codeHash = createHash("sha256").update(data.license.toUpperCase()).digest("hex");
    const { data: activation, error } = await supabaseAdmin.rpc(
      "activate_capital_vault_license",
      {
        p_buyer_email: data.email.toLowerCase(),
        p_code_hash: codeHash,
        p_device_id: data.deviceId,
        p_mentor_id: data.mentorId,
      },
    );

    if (error) {
      const message = error.message;
      if (message.includes("DEVICE_LIMIT_REACHED")) {
        return { ok: false as const, message: "This license is already active on its maximum number of devices." };
      }
      if (message.includes("LICENSE_EXPIRED")) {
        return { ok: false as const, message: "This license has expired. Contact your seller for help." };
      }
      if (message.includes("LICENSE_INACTIVE")) {
        return { ok: false as const, message: "This license is not active. Contact your seller for help." };
      }
      return { ok: false as const, message: "The license details do not match our records." };
    }

    return {
      ok: true as const,
      productName: activation?.[0]?.product_name ?? "CAPITAL VAULT V1.0",
    };
  });