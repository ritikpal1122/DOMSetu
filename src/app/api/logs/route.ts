import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "domsetu";
const COLLECTION = "activity_logs";

async function getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION);
}

// GET /api/logs?sessionId=abc123&page=/lab/forms&stage=staging
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");
        const page = searchParams.get("page");
        const stage = searchParams.get("stage");

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        const filter: Record<string, string> = { sessionId };
        if (page) filter.page = page;
        if (stage) filter.stage = stage;

        const collection = await getCollection();
        const logs = await collection.find(filter).sort({ timestamp: 1 }).toArray();

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("GET /api/logs error:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

// POST /api/logs
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, page, action, component, stage } = body;

        if (!sessionId || !action) {
            return NextResponse.json(
                { error: "sessionId and action are required" },
                { status: 400 }
            );
        }

        const collection = await getCollection();
        const doc = {
            sessionId,
            page: page || "/",
            action,
            component: component || "System",
            stage: stage || "",
            timestamp: new Date().toISOString(),
        };

        await collection.insertOne(doc);

        return NextResponse.json({ success: true, log: doc }, { status: 201 });
    } catch (error) {
        console.error("POST /api/logs error:", error);
        return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
    }
}

// DELETE /api/logs?sessionId=abc123&stage=staging
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");
        const stage = searchParams.get("stage");

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        const filter: Record<string, string> = { sessionId };
        if (stage) filter.stage = stage;

        const collection = await getCollection();
        const result = await collection.deleteMany(filter);

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("DELETE /api/logs error:", error);
        return NextResponse.json({ error: "Failed to delete logs" }, { status: 500 });
    }
}
