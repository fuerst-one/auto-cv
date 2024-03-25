import Link from "next/link";
import Image from "next/image";
import { IconLink } from "./IconLink";
import { SignUpForm } from "./SignUpForm";
import { FaMap } from "@react-icons/all-files/fa/FaMap";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";

export function Intro() {
  return (
    <>
      <Image
        src="/avatar.png"
        alt="Alexander Fuerst"
        width={80}
        height={80}
        className="h-20 w-20 print:mt-8"
      />
      <h1 className="font-display mt-6 text-4xl/tight text-white print:text-black">
        <span className="font-black">Alexander Fuerst</span>
        <br />
        <span className="text-2xl font-light text-sky-300 print:text-black">
          Curriculum Vitae & Portfolio
        </span>
      </h1>
      <p className="mt-4 text-sm/6 text-gray-300 print:text-black">
        I’m a creative slash inventor. I thrive in agile environments, making
        data actionable for you and your users.
      </p>
      <SignUpForm />
      <div className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-3 sm:gap-x-2 lg:justify-start print:block">
        <IconLink href="https://fuerst.one" icon={FaMap} className="flex-none">
          Homepage
          <span className="hidden print:inline"> (https://fuerst.one)</span>
        </IconLink>
        <IconLink
          href="https://www.linkedin.com/in/fuerst-one/"
          icon={FaLinkedin}
          className="flex-none"
        >
          LinkedIn
          <span className="hidden print:inline">
            {" "}
            (https://www.linkedin.com/in/fuerst-one/)
          </span>
        </IconLink>
        <IconLink
          href="https://github.com/fuerst-one"
          icon={FaGithub}
          className="flex-none"
        >
          GitHub
          <span className="hidden print:inline">
            {" "}
            (https://github.com/fuerst-one)
          </span>
        </IconLink>
      </div>
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
