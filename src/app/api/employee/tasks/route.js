import { NextResponse } from "next/server";
import db from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Helper Function: Operational Shift Date calculate karne ke liye
function getShiftOperationalDate() {
    // Force PKT / Local Server time consideration
    const now = new Date();
    
    // Agar time subah 6:00 AM se pehle ka hai (00:00 to 05:59)
    // To isko PCHLI TAREEKH (Yesterday) ki shift count karo
    if (now.getHours() < 6) {
        now.setDate(now.getDate() - 1);
    }
    
    // Returns YYYY-MM-DD
    return now.toLocaleDateString("en-CA");
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        // Agar client query param date bhej raha hai to wo lein,
        // nahi to OPERATIONAL SHIFT DATE calculate karein
        const date = searchParams.get("date") || getShiftOperationalDate();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Login required" },
                { status: 401 }
            );
        }

        // ==================================================
        // VERIFY TOKEN
        // ==================================================
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const employeeId = decoded.id || decoded._id || decoded.userId || null;

        if (!employeeId) {
            return NextResponse.json(
                { success: false, message: "User ID not found" },
                { status: 401 }
            );
        }

        // Fetch assigned tasks joining master table details
        const [tasks] = await db.query(
            `SELECT 
                da.id AS assignment_id,
                da.assignment_date,
                da.status AS assignment_status,
                da.comment,
                da.is_completed,
                mt.id AS task_id,
                mt.sequence_no,
                mt.name,
                mt.phone_number,
                mt.business_name,
                mt.is_locked
             FROM daily_assignments da
             JOIN master_tasks mt ON da.task_id = mt.id
             WHERE da.employee_id = ? 
               AND da.assignment_date = ? 
               AND mt.is_locked = FALSE
             ORDER BY da.is_completed ASC, mt.sequence_no ASC`,
            [employeeId, date]
        );

        return NextResponse.json({
            date, // Ye ab 12 AM ke baad bhi raat wali date hi return karega
            count: tasks.length,
            tasks
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}