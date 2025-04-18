import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// keperluan testing (nanti dihapus)
import { getSessionOrToken } from "@/lib/getSessionOrToken";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);
    
    if (!session || !["USER_KWARCAB", "USER_KWARAN"].includes(session.user.role)) {
        return NextResponse.json({ message: "Unauthorized: Only 'Kwaran' & 'Kwarcab' users can access this data" }, { status: 403 });
    }

    try {
        const whereClause: Prisma.KegiatanWhereInput = {};
    
        if (session.user.role === "USER_KWARAN") {
            whereClause["gugusDepan"] = { kwaranKode: session.user.kode_kwaran };
        } else if (session.user.role === "USER_KWARCAB") {
            // jika role USER_KWARCAB, ambil semua kegiatan dari gusdep dan kwaran di bawah kwarcab
        }
    
        const kegiatanList = await prisma.kegiatan.findMany({
            where: whereClause,
            select: { tingkat_kegiatan: true, gugusDepan: { select: { kwaranKode: true } } }
        });
    
        const result = {
            kegiatan_gusdep: { SIAGA: 0, PENGGALANG: 0, PENEGAK: 0, PANDEGA: 0 },
            kegiatan_kwaran: { SIAGA: 0, PENGGALANG: 0, PENEGAK: 0, PANDEGA: 0 },
        };
    
        for (const kegiatan of kegiatanList) {
            const jenjang = kegiatan.tingkat_kegiatan;
        
            if (jenjang) {
                if (kegiatan.gugusDepan) {
                    // validasi apakah kegiatan milik gusdep atau kwaran
                    if (session.user.role === "USER_KWARCAB") {
                        result.kegiatan_gusdep[jenjang]++;
                        result.kegiatan_kwaran[jenjang]++;
                    } else if (session.user.role === "USER_KWARAN") {
                        result.kegiatan_gusdep[jenjang]++;
                    }
                }
            }
        }
    
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching kegiatan per jenjang:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}