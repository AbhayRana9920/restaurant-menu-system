import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <>
      <Head>
        <title>Restaurant Manager</title>
        <meta name="description" content="Manage your restaurant menu digitally" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Restaurant <span className="text-[hsl(280,100%,70%)]">Manager</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/auth/login"
            >
              <h3 className="text-2xl font-bold">Login →</h3>
              <div className="text-lg">
                Access your dashboard to manage restaurants and menus.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/restaurants"
            >
              <h3 className="text-2xl font-bold">Public Access →</h3>
              <div className="text-lg">
                Scan a QR code or visit a restaurant link to view the menu.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">Get Started</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
