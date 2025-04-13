import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isValidEnum } from "@/lib/helpers/enumValidator";
import { getGusdepKodeByRegion } from "@/lib/helpers/getGusdep";
import supabase from "@/lib/supabase";
import { randomUUID } from "crypto";
import path from "path";
import { Prisma } from "@prisma/client";

// keperluan testing (nanti dihapus)
import { getSessionOrToken } from "@/lib/getSessionOrToken";

// handler tambah data kegiatan
export async function POST(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);
    
    if (!session || session.user.role === "USER_SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized: Only 'Kwarcab/Kwaran/Gusdep' users can add activity" }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        
        const nama_kegiatan = formData.get("nama_kegiatan")?.toString().trim();
        const deskripsi = formData.get("deskripsi")?.toString().trim();
        const lokasi = formData.get("lokasi")?.toString().trim();
        const tingkat_kegiatan = formData.get("tingkat_kegiatan")?.toString().trim();
        const tanggal = formData.get("tanggal")?.toString().trim();
        const pesertaRaw = formData.get("pesertaIds")?.toString().trim();
        const laporanFile = formData.get("laporan") as File;

        // validasi input
        if (!nama_kegiatan || !deskripsi || !lokasi || !tingkat_kegiatan || !tanggal || !laporanFile || !pesertaRaw) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // validasi enum
        if (!isValidEnum("Tingkat", tingkat_kegiatan)) {
            return NextResponse.json({ message: "Invalid tingkat kegiatan" }, { status: 400 });
        }

        // atur max kata deskripsi
        if (deskripsi.split(/\s+/).length > 300) {
            return NextResponse.json({ message: "The description is too long (max 300 words)" }, { status: 400 });
        }

        // validasi file
        if (laporanFile.type !== "application/pdf") {
            return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await laporanFile.arrayBuffer());
        const maxSize = 2 * 1024 * 1024;

        if (buffer.length > maxSize) {
            return NextResponse.json({ message: "File size must be less than 2MB" }, { status: 400 });
        }

        // validasi input partisipan
        let pesertaIds: string[];

        try {
            pesertaIds = JSON.parse(pesertaRaw);
            if (!Array.isArray(pesertaIds) || pesertaIds.length === 0) {
                return NextResponse.json({ message: "At least one participant must be selected" }, { status: 400 });
            }
        } catch (error) {
            return NextResponse.json({ message: "Invalid peserta format", error }, { status: 400 });
        }

        // validasi anggota berdasarkan role user
        let anggotaValid: string[] = [];

        if (session.user.role === "USER_GUSDEP" && session.user.kode_gusdep) {
            anggotaValid = (await prisma.anggota.findMany({
                where: {
                    gusdepKode: session.user.kode_gusdep,
                    id_anggota: { in: pesertaIds }
                },
                select: { id_anggota: true }
            })).map(a => a.id_anggota);
            
        } else if (session.user.role === "USER_KWARAN" && session.user.kode_kwaran) {
            const allowedGusdepKode = await getGusdepKodeByRegion(session.user.kode_kwaran, true);
            anggotaValid = (await prisma.anggota.findMany({
                where: {
                    gusdepKode: { in: allowedGusdepKode },
                    id_anggota: { in: pesertaIds }
                },
                select: { id_anggota: true }
            })).map(a => a.id_anggota);
            
        } else if (session.user.role === "USER_KWARCAB" && session.user.kode_kwarcab) {
            const allowedGusdepKode = await getGusdepKodeByRegion(session.user.kode_kwarcab, false);
            anggotaValid = (await prisma.anggota.findMany({
                where: {
                    gusdepKode: { in: allowedGusdepKode },
                    id_anggota: { in: pesertaIds }
                },
                select: { id_anggota: true }
            })).map(a => a.id_anggota);
        }

        if (anggotaValid.length !== pesertaIds.length) {
            return NextResponse.json({ message: "some participants are not valid or outside your area" }, { status: 403 });
        }

        // upload laporan kegiatan (pdf) ke supabase storage bucket
        const ext = path.extname(laporanFile.name) || ".pdf";
        const fileName = `${randomUUID()}${ext}`;
        const storagePath = `laporan-kegiatan/${fileName}`;

        const { error: uploadError } = await supabase
            .storage
            .from("file-bucket-nextjs")
            .upload(storagePath, buffer, {
                contentType: laporanFile.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json({ message: "Failed to upload laporan kegiatan" }, { status: 500 });
        }

        const { data: publicUrlData } = supabase
            .storage
            .from("file-bucket-nextjs")
            .getPublicUrl(storagePath);

        const laporanPath = publicUrlData?.publicUrl;

        let gusdepKode: string | undefined = undefined;
        let kwaranKode: string | undefined = undefined;
        let kwarcabKode: string | undefined = undefined;

        if (session.user.role === "USER_GUSDEP") {
            gusdepKode = session.user.kode_gusdep;
            kwaranKode = session.user.kode_kwaran;
            kwarcabKode = session.user.kode_kwarcab;
        } else if (session.user.role === "USER_KWARAN") {
            kwaranKode = session.user.kode_kwaran;
            kwarcabKode = session.user.kode_kwarcab;
        } else if (session.user.role === "USER_KWARCAB") {
            kwarcabKode = session.user.kode_kwarcab;
        }

        // simpan kegiatan
        const kegiatan = await prisma.kegiatan.create({
            data: {
                nama_kegiatan,
                deskripsi,
                lokasi,
                tingkat_kegiatan,
                tanggal: new Date(tanggal),
                laporan: laporanPath,
                gusdepKode,
                kwaranKode,
                kwarcabKode,
            },
        });

        // simpan partisipan
        await prisma.partisipan.createMany({
            data: anggotaValid.map(id => ({
                anggotaId: id,
                kegiatanId: kegiatan.id_kegiatan,
            })),
        });

        return NextResponse.json({ message: "Activity data successfully added", kegiatan }, { status: 201 });
    } catch (error) {
        console.error("Error adding activity:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// handler melihat data kegiatan (all roles with access restrictions)
export async function GET(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);
    
    if (!session || session.user.role === "USER_SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized: Only 'Kwarcab/Kwaran/Gusdep' users can retrieve activities" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const kode_kwaran = searchParams.get("kode_kwaran");
    const kode_gusdep = searchParams.get("kode_gusdep");
    // const detail = searchParams.get("detail");

    try {
        const whereClause: Prisma.KegiatanWhereInput = {};

        // Validasi akses berdasarkan query
        if (kode_kwaran) {
            if (session.user.role !== "USER_KWARCAB") {
                return NextResponse.json({ message: "Forbidden: Only KWARCAB can access kode_kwaran" }, { status: 403 });
            }
            whereClause.kwaranKode = kode_kwaran;
        }

        if (kode_gusdep) {
            if (session.user.role === "USER_KWARCAB") {
                if (!session.user.kode_kwarcab) {
                    return NextResponse.json({ message: "Missing kode_kwarcab in session" }, { status: 400 });
                }
                const gusdepList = await getGusdepKodeByRegion(session.user.kode_kwarcab, false);
                if (!gusdepList.includes(kode_gusdep)) {
                    return NextResponse.json({ message: "Forbidden: Gusdep not in your wilayah" }, { status: 403 });
                }
                whereClause.gusdepKode = kode_gusdep;

            } else if (session.user.role === "USER_KWARAN") {
                if (!session.user.kode_kwaran) {
                    return NextResponse.json({ message: "Missing kode_kwaran in session" }, { status: 400 });
                }
                const gusdepList = await getGusdepKodeByRegion(session.user.kode_kwaran, true);
                if (!gusdepList.includes(kode_gusdep)) {
                    return NextResponse.json({ message: "Forbidden: Gusdep not in your wilayah" }, { status: 403 });
                }
                whereClause.gusdepKode = kode_gusdep;

            } else if (session.user.role === "USER_GUSDEP") {
                if (kode_gusdep !== session.user.kode_gusdep) {
                    return NextResponse.json({ message: "Forbidden: Can only access your own gusdep" }, { status: 403 });
                }
                whereClause.gusdepKode = kode_gusdep;
            }
        }

        // Jika tidak pakai query param, tampilkan data milik sendiri
        if (!kode_kwaran && !kode_gusdep) {
            if (session.user.role === "USER_GUSDEP") {
                whereClause.gusdepKode = session.user.kode_gusdep;
            } else if (session.user.role === "USER_KWARAN") {
                whereClause.kwaranKode = session.user.kode_kwaran;
            } else if (session.user.role === "USER_KWARCAB") {
                whereClause.kwarcabKode = session.user.kode_kwarcab;
            }
        }

        const kegiatanList = await prisma.kegiatan.findMany({
            where: whereClause,
            select: {
                nama_kegiatan: true,
                lokasi: true,
                tanggal: true,
                tingkat_kegiatan: true,
            },
        });

        return NextResponse.json(kegiatanList);
    } catch (error) {
        console.error("Error retrieving activity:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
