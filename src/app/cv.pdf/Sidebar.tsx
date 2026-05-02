import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { CvProject } from "@/server/notion/getCvProjects";

const rankByFrequency = (
  projects: CvProject[],
  pick: (p: CvProject) => string[],
  limit: number,
): string[] => {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const item of pick(project)) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
};

const Section = ({ label, children }: { label: string; children: string }) => (
  <View style={styles.sectionGroup}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <Text style={styles.sidebarItem}>{children}</Text>
  </View>
);

export const Sidebar = ({ projects }: { projects: CvProject[] }) => {
  const tools = rankByFrequency(projects, (p) => p.tools, 14).join(" · ");
  const industries = rankByFrequency(projects, (p) => p.industries, 5).join(
    " · ",
  );

  return (
    <View style={styles.sidebar}>
      <Section label="Tools">{tools}</Section>
      <Section label="Industries">{industries}</Section>
      <Section label="Languages">
        Deutsch (Muttersprachlich) · English (Verhandlungssicher)
      </Section>
      <Section label="Location">Würzburg, DE · Remote / On-site</Section>
      <Section label="Education">
        B.Sc. E-Commerce · TH Würzburg-Schweinfurt · 2020
      </Section>
    </View>
  );
};
