'use client'
import { SignIn } from "@clerk/nextjs";

export default function Login() {
    return(
        <>
        <div className="min-h-screen flex flex-col items-center justify-center ">
        <SignIn/>
        </div>
        </>
    )
}