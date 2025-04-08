import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
const page = async () => {
    const session = await getServerSession(authOptions);
    console.log(session);
    return <div> <h1>Home</h1> </div>
}

export default page;