import { connectDB } from "@/app/lib/mongo";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {

    const body = await req.json();

    try {

        await connectDB();

        const { email, password } = body;

        // cheking user already exist or not
        const exist = await User.findOne({ email })

        if (exist) return Response.json({ message: 'User already exists' }, { status: 400 });



        if (password.length < 6) {
            return Response.json({ success: false, message: "password must be at least 6 characters" }, { status: 400 });
        }

        //hashing password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword
        });

        const user = await newUser.save();

        return Response.json({ success: true })
    } catch (error) {
        console.log(body);
        console.error(error);
        return Response.json({ success: false, message: "Server error" }, { status: 400 });
    }

}