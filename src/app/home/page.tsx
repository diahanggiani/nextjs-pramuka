// import { authOptions } from "@/lib/auth";
// import { getServerSession } from "next-auth";

'use client';
import { Button } from '@/components/ui/button';
import { signOut } from "next-auth/react";

const page = async () => {
    // const session = await getServerSession(authOptions);
    // console.log(session);
    return (
        <div className='bg-slate-500'>
            <div>
                <Button className='w-full mt-6' type='submit' onClick={() => signOut({ callbackUrl: '/login' })}>
                    Logout
                </Button>
            </div>

            <div>
                <input type="file" multiple className="bg-white" />
                <button className='py-2 w-40 rounded-lg' type='submit'>
                    Upload foto profil
                </button>
            </div>

            <div>
                <input type="file" multiple className="bg-white" />
                <button className='py-2 w-40 rounded-lg' type='submit'>
                    Upload laporan
                </button>
            </div>

            <div>
                <input type="file" multiple className="bg-white" />
                <button className='py-2 w-40 rounded-lg' type='submit'>
                    Upload ajuan nta
                </button>
            </div>
        </div>
    );
}

export default page;