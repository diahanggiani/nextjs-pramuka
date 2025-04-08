// handler buat akun oleh superadmin

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "USER_SUPERADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { username, password, role, nama, kode, kode_kwaran, kode_kwarcab } = body;

        // validasi input
        if (!username || !password || !role || !nama || !kode) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // format username
        if (!/^\S+$/.test(username)) {
            return NextResponse.json({ message: "Username cannot contain spaces" }, { status: 400 });
        }

        // format password
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
            return NextResponse.json({
                message: "Password must be at least 8 characters long, contain uppercase, lowercase letters, and numbers."
            }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { username } });
            if (existingUser) {
                return NextResponse.json({ message: "Username already exists" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        let newUser;

        // pembuatan berdasarkan role yang diminta
        if (role === "USER_KWARCAB") {
            if (!kode_kwarcab) return NextResponse.json({ message: "Kode Kwarcab diperlukan" }, { status: 400 });

            const existingKwarcab = await prisma.kwarcab.findUnique({ where: { kode_kwarcab: kode } });
            if (existingKwarcab) {
                return NextResponse.json({ message: "Kode Kwarcab sudah digunakan" }, { status: 400 });
            }

            newUser = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    role,
                    kwarcab: {
                        create: {
                            nama_kwarcab: nama,
                            kode_kwarcab: kode,
                        }
                    }
                },
                select: {
                    id: true,
                    username: true,
                    role: true,
                    createdAt: true
                }
            });

        } else if (role === "USER_KWARAN") {
        if (!kode_kwarcab) return NextResponse.json({ message: "Kode Kwarcab diperlukan" }, { status: 400 });

        const parentKwarcab = await prisma.kwarcab.findUnique({ where: { kode_kwarcab } });
        if (!parentKwarcab) return NextResponse.json({ message: "Kode Kwarcab tidak valid" }, { status: 400 });

        const existingKwaran = await prisma.kwaran.findUnique({ where: { kode_kwaran: kode } });
        if (existingKwaran) {
            return NextResponse.json({ message: "Kode Kwaran sudah digunakan" }, { status: 400 });
        }

        newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                kwaran: {
                    create: {
                        nama_kwaran: nama,
                        kode_kwaran: kode,
                        kwarcab: {
                            connect: {
                                kode_kwarcab
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true
            }
        });

        } else if (role === "USER_GUSDEP") {
        if (!kode_kwarcab || !kode_kwaran) return NextResponse.json({ message: "Kode Kwarcab dan Kwaran diperlukan" }, { status: 400 });

        const parentKwaran = await prisma.kwaran.findUnique({
            where: { kode_kwaran },
            include: { kwarcab: true }
        });
        
        if (!parentKwaran || parentKwaran.kwarcab?.kode_kwarcab !== kode_kwarcab) {
            return NextResponse.json({ message: "Relasi Kwarcab dan Kwaran tidak valid" }, { status: 400 });
        }

        const existingGusdep = await prisma.gugusDepan.findUnique({ where: { kode_gusdep: kode } });
        if (existingGusdep) {
            return NextResponse.json({ message: "Kode Gugus Depan sudah digunakan" }, { status: 400 });
        }

        newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                gugusDepan: {
                    create: {
                        nama_gusdep: nama,
                        kode_gusdep: kode,
                        kwaran: {
                            connect: {
                                kode_kwaran
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true
            }
        });

        } else {
        return NextResponse.json({ message: "Role tidak valid" }, { status: 400 });
        }

        return NextResponse.json({ user: newUser, message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
