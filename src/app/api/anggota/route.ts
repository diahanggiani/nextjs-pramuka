// handler untuk melihat dan menambah anggota (role: gugus depan)

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST (req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "USER_GUSDEP" ) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const { nama_agt, nta, tgl_lahir, alamat, gender, agama, jenjang_agt, status_agt } = body;

        if (!nama_agt || !nta || !tgl_lahir || !alamat || !gender || !agama || !jenjang_agt || !status_agt ) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // validasi enum

    } catch (error) {
        console.error("Errro creating user:", error);
        return NextResponse.json({ mesage: "Internal Server Error" }, { status: 500 });
    }
}