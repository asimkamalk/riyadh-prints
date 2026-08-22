import { NextResponse } from "next/server";

import { getRedirectMap } from "@/server/queries/redirects";

export async function GET() {
  const map = await getRedirectMap();
  return NextResponse.json(map);
}
