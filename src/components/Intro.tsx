import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { SignUpForm } from "./SignUpForm";
import { Contact } from "./Contact";

export function Intro({ claim }: { claim: ReactNode }) {
  return (
    <>
      <Image
        src="/avatar.png"
        alt="Alexander Fuerst"
        width={80}
        height={80}
        className="h-20 w-20 print:mt-8"
      />
      <h1 className="font-display mt-6 text-4xl/tight text-black dark:text-white print:text-black">
        <span className="font-black">Alexander Fuerst</span>
        <br />
        <span className="text-2xl font-light text-sky-300 dark:text-sky-300 print:text-black">
          UI Engineer – CV & Portfolio
        </span>
      </h1>
      <p className="mt-4 text-sm/6 text-gray-700 dark:text-gray-300 print:text-black">
        {claim}
      </p>
      <SignUpForm />
      <Contact />
    </>
  );
}

export function IntroFooter() {
  return (
    <p className="flex items-baseline gap-x-2 text-[0.8125rem]/6 text-gray-500 print:hidden">
      <Link href="https://fuerst.one/imprint">Imprint</Link>|
      <Link href="https://fuerst.one/privacy-policy">Privacy Policy</Link>
    </p>
  );
}
