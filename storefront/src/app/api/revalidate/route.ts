import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret")

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  let body: { tag?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.tag || typeof body.tag !== "string") {
    return NextResponse.json({ message: "Missing or invalid tag" }, { status: 400 })
  }

  revalidateTag(body.tag)

  return NextResponse.json({ revalidated: true, tag: body.tag })
}
