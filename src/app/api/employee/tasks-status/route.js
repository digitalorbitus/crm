import { NextResponse } from "next/server";
import db from "../../../lib/db"


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        // Fetch assigned tasks joining master table details
        const [rows] = await db.query(
            `SELECT * FROM status_configs`
        );

        return NextResponse.json({
            data: rows,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}