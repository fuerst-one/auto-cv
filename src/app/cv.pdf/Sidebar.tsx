import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { CvProject } from "@/server/notion/getCvProjects";
import { CvOwner } from "@/server/notion/getCvOwner";

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

const formatLocation = (owner: CvOwner): string => {
  const { street, zip, city, country } = owner.address;
  const streetLine = street;
  const zipCity = [zip, city].filter(Boolean).join(" ");
  return [streetLine, zipCity, country].filter(Boolean).join(" · ");
};

export const Sidebar = ({
  projects,
  owner,
}: {
  projects: CvProject[];
  owner: CvOwner;
}) => {
  const tools = rankByFrequency(projects, (p) => p.tools, 14).join(" · ");
  const industries = rankByFrequency(projects, (p) => p.industries, 5).join(
    " · ",
  );

  return (
    <View style={styles.sidebar}>
      <Section label="Tools">{tools}</Section>
      <Section label="Industries">{industries}</Section>
      <Section label="Languages">{owner.languages}</Section>
      <Section label="Location">{formatLocation(owner)}</Section>
      <Section label="Education">{owner.education}</Section>
    </View>
  );
};
