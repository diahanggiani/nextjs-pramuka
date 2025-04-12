import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import supabase from '@/lib/supabase';
import path from 'path';
import { randomUUID } from 'crypto';

// keperluan testing (nanti dihapus)
import { getSessionOrToken } from "@/lib/getSessionOrToken";

// handler untuk lihat profile user yang sedang login
export async function GET(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);
    
    if (!session || session.user.role === "USER_SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized: Only 'Kwarcab/Kwaran/Gusdep' users can see profile" }, { status: 403 });
    }

    try {
        let profile;

        // cek role dan pastikan kode yang sesuai ada dalam token
        if (session.user.role === 'USER_GUSDEP') {
            if (!session.user.kode_gusdep) {
                return NextResponse.json({ message: 'Gugus depan code not found in token' }, { status: 400 });
            }
            profile = await prisma.gugusDepan.findUnique({
                where: { kode_gusdep: session.user.kode_gusdep },
            });

        } else if (session.user.role === 'USER_KWARAN') {
            if (!session.user.kode_kwaran) {
                return NextResponse.json({ message: 'Kwaran code not found in token' }, { status: 400 });
            }
            profile = await prisma.kwaran.findUnique({
                where: { kode_kwaran: session.user.kode_kwaran },
            });

        } else if (session.user.role === 'USER_KWARCAB') {
            if (!session.user.kode_kwarcab) {
                return NextResponse.json({ message: 'Kwarcab code not found in token' }, { status: 400 });
            }
            profile = await prisma.kwarcab.findUnique({
                where: { kode_kwarcab: session.user.kode_kwarcab },
            });

        } else {
            return NextResponse.json({ message: 'Role not recognized' }, { status: 403 });
        }

        if (!profile) {
            return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
        }
        return NextResponse.json(profile, { status: 200 });

    } catch (error) {
        console.error("Error retrieving data:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// handler untuk edit profile user yang sedang login
export async function PATCH(req: NextRequest) {
    // keperluan testing (nanti dihapus)
    const session = await getSessionOrToken(req);
    console.log("SESSION DEBUG:", session);

    // session yang asli (nanti uncomment)
    // const session = await getServerSession(authOptions);
    
    if (!session || session.user.role === "USER_SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized: Only 'Kwarcab/Kwaran/Gusdep' users can edit profile" }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        
        const alamat = formData.get("alamat")?.toString().trim();
        const nama_sekolah = formData.get("nama_sekolah")?.toString().trim();
        const npsn = formData.get("npsn")?.toString().trim();

        const kepala_sekolah = formData.get("kepala_sekolah")?.toString().trim();
        const kepala_kwaran = formData.get("kepala_kwaran")?.toString().trim();
        const kepala_kwarcab = formData.get("kepala_kwarcab")?.toString().trim();

        const foto = formData.get("foto") as File | null;

        const role = session.user.role;
        let newFotoUrl: string | undefined = undefined;

        if (foto && foto.size === 0) {
            console.log("FOTO SIZE:", foto?.size);

            // validasi file
            if (!["image/jpeg", "image/png", "image/jpg"].includes(foto.type)) {
                return NextResponse.json({ message: "Only JPG, JPEG, or PNG files are allowed" }, { status: 400 });
            }

            const buffer = Buffer.from(await foto.arrayBuffer());
            const maxSize = 500 * 1024;
            if (buffer.length > maxSize) {
                return NextResponse.json({ message: "File size must be less than 500KB" }, { status: 400 });
            }

            const ext = path.extname(foto.name) || ".jpg" || ".jpeg" || ".png";
            const filename = `${randomUUID()}${ext}`;
            const storagePath = `foto-profil/${filename}`;

            const { error: uploadError } = await supabase.storage
                .from("image-bucket-nextjs")
                .upload(storagePath, buffer, {
                    contentType: foto.type,
                    upsert: false,
                });

            if (uploadError) {
                return NextResponse.json({ message: "Failed to upload photo", error: uploadError }, { status: 500 });
            }

            const { data: publicUrlData } = supabase.storage
                .from("image-bucket-nextjs")
                .getPublicUrl(storagePath);

            newFotoUrl = publicUrlData?.publicUrl;
            console.log("Public URL:", newFotoUrl);
        }

        let updated;

        if (role === 'USER_GUSDEP') {
            const updateData = {
                alamat,
                npsn,
                nama_sekolah,
                kepala_sekolah,
                ...(newFotoUrl && { foto_gusdep: newFotoUrl }),
            };

            updated = await prisma.gugusDepan.update({
                where: { kode_gusdep: session.user.kode_gusdep },
                data: updateData,
            });

        } else if (role === 'USER_KWARAN') {
            const updateData = {
                alamat,
                kepala_kwaran,
                ...(newFotoUrl && { foto_kwaran: newFotoUrl }),
            };
        
            updated = await prisma.kwaran.update({
                where: { kode_kwaran: session.user.kode_kwaran },
                data: updateData,
            });

        } else if (role === 'USER_KWARCAB') {
            const updateData = {
                alamat,
                kepala_kwarcab,
                ...(newFotoUrl && { foto_kwarcab: newFotoUrl }),
            };
        
            updated = await prisma.kwarcab.update({
                where: { kode_kwarcab: session.user.kode_kwarcab },
                data: updateData,
            });
        } else {
            return NextResponse.json({ message: 'Role not recognized' }, { status: 403 });
        }

        return NextResponse.json({ message: 'Profile updated successfully', profile: updated }, { status: 200 });
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
