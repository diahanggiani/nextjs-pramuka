import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import supabase from "@/lib/supabase";
import { randomUUID } from "crypto";
import { isValidEnum } from "@/lib/helpers/enumValidator";
import { Ajuan } from "@prisma/client";
import path from "path";
import { generateAjuanWhereClause } from "@/lib/helpers/queryClause";

// keperluan testing (nanti dihapus)
import { getSessionOrToken } from "@/lib/getSessionOrToken";

// handler untuk menambah data ajuan oleh user gusdep
export async function POST(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "USER_GUSDEP") {
        return NextResponse.json({ message: "Unauthorized: Only 'Gugus Depan' users can submit form" }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const nama_ajuan = formData.get("nama_ajuan")?.toString().trim();
        const tingkat = formData.get("tingkat")?.toString().trim();
        const file = formData.get("formulir") as File;

        // Query untuk mencari kode_kwarcab berdasarkan kode_gusdep
        const gusdep = await prisma.gugusDepan.findUnique({
            where: { kode_gusdep: session.user.kode_gusdep },
            include: {
                kwaran: {
                    include: {
                        kwarcab: true,
                    },
                },
            },
        });

        
        // Pastikan kode_kwarcab ditemukan
        const kode_kwarcab = gusdep?.kwaran?.kwarcab?.kode_kwarcab;

        if (!kode_kwarcab) {
            return NextResponse.json({ error: "Kode kwarcab tidak ditemukan" }, { status: 400 });
        }

        // validasi input
        if (!nama_ajuan || !tingkat || !file) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // validasi enum
        if (!isValidEnum("Tingkat", tingkat)) {
            return NextResponse.json({ message: "Invalid jenjang anggota" }, { status: 400 });
        }

        // validasi file
        if (file.type !== "application/pdf") {
            return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const maxSize = 2 * 1024 * 1024;

        if (buffer.length > maxSize) {
            return NextResponse.json({ message: "File size must be less than 2MB" }, { status: 400 });
        }

        // upload file ke supabase storage
        const ext = path.extname(file.name) || ".pdf";
        const filename = `${randomUUID()}${ext}`;
        const storagePath = `formulir-ajuan/${filename}`;

        const { error: uploadError } = await supabase
            .storage
            .from("file-bucket-nextjs")
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ message: "Failed to upload formulir ajuan" }, { status: 500 });
        }

        const { data: publicUrlData } = supabase
            .storage
            .from("file-bucket-nextjs")
            .getPublicUrl(storagePath);

        const url = publicUrlData?.publicUrl;

        // Simpan data ajuan
        const newAjuan = await prisma.ajuan.create({
            data: {
                nama_ajuan,
                tingkat,
                formulir: url,
                gusdepKode: session.user.kode_gusdep!,// ambil kode_gusdep dari session
                kwarcabKode: kode_kwarcab, // pake kode_kwarcab yang ditemukan
            },
        });
          
        return NextResponse.json({ message: "Ajuan successfully added", newAjuan}, { status: 200 });
    } catch (error) {
        console.error("Error submiting form:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// handler untuk melihat data ajuan oleh user gusdep
export async function GET(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);

    if (!session || !["USER_GUSDEP", "USER_KWARCAB"].includes(session.user.role)) {
        return NextResponse.json({ message: "Unauthorized: Only 'Gugus Depan' & 'Kwarcab' users can view data ajuan" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get("status") as "DITERIMA" | "DITOLAK" | "MENUNGGU" | null;
        const searchQuery = searchParams.get("search") || undefined;

        let ajuanList: Ajuan[] = [];

        if (session.user.role === "USER_GUSDEP") {
            const whereClause = generateAjuanWhereClause({ gusdepKode: session.user.kode_gusdep }, statusFilter || undefined, searchQuery);
            
            // hanya lihat ajuan milik sendiri
            ajuanList = await prisma.ajuan.findMany({
                // where: { gusdepKode: session.user.kode_gusdep },
                where: whereClause,
                orderBy: { createdAt: "desc" },
            });

        } else if (session.user.role === "USER_KWARCAB") {
            const whereClause = generateAjuanWhereClause({ kwarcabKode: session.user.kode_kwarcab },statusFilter || undefined,searchQuery);

            // lihat semua ajuan dalam kwarcab
            ajuanList = await prisma.ajuan.findMany({
                // where: { kwarcabKode: session.user.kode_kwarcab },
                where: whereClause,
                orderBy: { createdAt: "desc" },
            });
        }

        return NextResponse.json(ajuanList);
    } catch (error) {
        console.error("Error viewing form:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
