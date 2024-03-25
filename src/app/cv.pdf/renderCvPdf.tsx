import React, { Fragment, ReactNode } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import { CvProject } from "@/server/notion/getCvProjects";

export const renderCvPdf = (projects: CvProject[]) => {
  return renderToBuffer(<CvPdf projects={projects} />);
};

const CvPdf = ({ projects }: { projects: CvProject[] }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Alexander Fürst</Text>
        {projects.map((project) => (
          <Fragment key={project.id}>
            <ProjectCard project={project} />
            <View style={styles.divider}></View>
          </Fragment>
        ))}
      </Page>
    </Document>
  );
};

const ProjectCard = ({ project }: { project: CvProject }) => {
  return (
    <View style={styles.section}>
      <View style={styles.columnParent}>
        <View style={styles.columnStart}>
          <Text style={styles.subheading}>
            {project.name} ({project.projectType})
          </Text>
          <Text style={styles.paragraph}>
            {project.startDate} - {project.endDate}
          </Text>
        </View>
        <View style={styles.columnEnd}>
          {project.logo?.length && (
            <Image
              src={project.logo[0]}
              style={{ width: "auto", height: 48 }}
            />
          )}
        </View>
      </View>
      <View style={styles.paragraph}>
        <MetaTable project={project} />
      </View>
    </View>
  );
};

const MetaTable = ({ project }: { project: CvProject }) => {
  const rows: (keyof CvProject)[] = [
    "url",
    "clients",
    "industries",
    "experiences",
    "tools",
    "languages",
    "workplace",
  ];

  const filteredFields = Object.fromEntries(
    rows
      .filter((key) => {
        const value = project[key];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== null;
      })
      .map((key) => [key, project[key]]),
  );

  return (
    <>
      {Object.entries(filteredFields).map(([name, value]) => (
        <View key={name} style={styles.columnParent}>
          <View style={styles.tableHeaderColumn}>
            <Text>{name}</Text>
          </View>
          <Text style={styles.tableColumn}>
            <Property name={name as keyof CvProject} value={value} />
          </Text>
        </View>
      ))}
    </>
  );
};

const Property = <TKey extends keyof CvProject>({
  name,
  value,
}: {
  name: TKey;
  value: CvProject[TKey];
}) => {
  switch (name) {
    case "clients":
      // case "references":
      return (
        <Text style={styles.tagList}>
          {(value as { id: string; name: string }[]).map((item) => (
            <Tag key={item.id}>{item.name}</Tag>
          ))}
        </Text>
      );
    case "url":
      if (!value) {
        return null;
      }
      return <Text>{value as string}</Text>;
    default:
      if (Array.isArray(value)) {
        return (
          <Text style={styles.tagList}>
            {(value as string[]).map((i, idx) => (
              <Tag key={idx}>{i}</Tag>
            ))}
          </Text>
        );
      }
      return <Text>{value as string}</Text>;
  }
};

export const Tag = ({ children }: { children: ReactNode }) => {
  return <Text style={styles.tag}>{children}, </Text>;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 600,
    color: "#131925",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 400,
    color: "#131925",
    marginBottom: 4,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#999999",
    margin: "12px 6px 12px 6px",
  },
  paragraph: {
    fontSize: 12,
    color: "#212935",
    lineHeight: 1.67,
  },
  columnParent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  columnStart: {
    flex: 1,
  },
  columnEnd: {
    alignItems: "flex-end",
  },
  tableRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
    height: "auto",
    paddingVertical: 4,
  },
  tableHeaderColumn: {
    width: 120,
    fontWeight: 900,
    color: "#131925",
    height: "auto",
  },
  tableColumn: {
    flex: 1,
    color: "#131925",
    height: "auto",
    maxWidth: "calc(100% - 120px)",
  },
  tagList: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    height: "auto",
  },
  tag: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.67,
    color: "#131925",
  },
});
