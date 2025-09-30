import { IconLink } from "./IconLink";
import { FaMap } from "@react-icons/all-files/fa/FaMap";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";

export const Contact = () => {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-x-2 gap-y-3 lg:justify-start print:block">
      <IconLink
        href="https://fuerst.one"
        icon={FaMap}
        className="flex-none"
      >
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
  );
};
