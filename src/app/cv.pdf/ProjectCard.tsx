import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { CvProject } from "@/server/notion/getCvProjects";
import { flattenRichText, truncateAtSentence } from "./flattenRichText";

const formatYearRange = (startDate: string, endDate: string | null): string => {
  const startYear = startDate.slice(0, 4);
  if (!endDate) {
    return `${startYear} → present`;
  }
  const endYear = endDate.slice(0, 4);
  return startYear === endYear ? startYear : `${startYear}–${endYear}`;
};

export const ProjectCard = ({ project }: { project: CvProject }) => {
  const description = truncateAtSentence(
    flattenRichText(project.description),
    180,
  );
  const clientNames = project.clients
    .map((c) => c.name)
    .slice(0, 2)
    .join(", ");
  const industries = project.industries.slice(0, 2).join(", ");
  const tools = project.tools.slice(0, 8).join(" · ");
  const metaPieces = [clientNames, industries].filter(Boolean);

  return (
    <View style={styles.projectCard} wrap={false}>
      <Text style={styles.projectTitle}>
        {project.name}
        <Text style={{ fontWeight: 400 }}>
          {"  "}— {project.projectType} ·{" "}
          {formatYearRange(project.startDate, project.endDate)}
        </Text>
      </Text>
      {metaPieces.length > 0 && (
        <Text style={styles.projectMeta}>{metaPieces.join(" · ")}</Text>
      )}
      {description && (
        <Text style={styles.projectDescription}>{description}</Text>
      )}
      {tools && <Text style={styles.projectTools}>{tools}</Text>}
    </View>
  );
};
