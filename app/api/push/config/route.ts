import { NextResponse } from "next/server";
import {
  getVapidPublicKey,
  isPushSendConfigured,
} from "../../../../lib/pushNotifications";

export async function GET() {
  const publicKey = getVapidPublicKey();

  return NextResponse.json({
    enabled: Boolean(publicKey),
    sendEnabled: isPushSendConfigured(),
    publicKey,
  });
}
