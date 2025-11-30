import Head from "next/head";
import { LoginForm } from "~/components/auth/login-form";

export default function LoginPage() {
    return (
        <>
            <Head>
                <title>Login - Restaurant Manager</title>
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-[5rem]">
                        Restaurant <span className="text-primary">Manager</span>
                    </h1>
                    <LoginForm />
                </div>
            </main>
        </>
    );
}
