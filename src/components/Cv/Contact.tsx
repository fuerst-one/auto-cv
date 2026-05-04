import { IconLink } from "../IconLink";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";

export const Contact = () => {
  return (
    <div className="flex flex-wrap justify-center gap-x-2 gap-y-3 lg:justify-start print:block">
      <IconLink
        href="https://github.com/fuerst-one"
        icon={FaGithub}
        className="flex-1 justify-center"
      >
        GitHub
        <span className="hidden print:inline">
          {" "}
          (https://github.com/fuerst-one)
        </span>
      </IconLink>
      <IconLink
        href="https://www.linkedin.com/in/fuerst-one/"
        icon={FaLinkedin}
        className="flex-1 justify-center"
      >
        LinkedIn
        <span className="hidden print:inline">
          {" "}
          (https://www.linkedin.com/in/fuerst-one/)
        </span>
      </IconLink>
    </div>
  );
};
