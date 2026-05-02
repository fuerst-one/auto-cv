import {
  Page,
  Text,
  View,
  Document,
  renderToBuffer,
} from "@react-pdf/renderer";
import "./fonts";
import { styles } from "./styles";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ProjectCard } from "./ProjectCard";
import { CvProject } from "@/server/notion/getCvProjects";

type CvPdfProps = {
  featuredProjects: CvProject[];
  allProjects: CvProject[];
};

export const renderCvPdf = (props: CvPdfProps) =>
  renderToBuffer(<CvPdf {...props} />);

const CvPdf = ({ featuredProjects, allProjects }: CvPdfProps) => (
  <Document
    title="Alexander Fürst — CV"
    author="Alexander Fürst"
    creator="fuerst.one"
  >
    <Page size="A4" style={styles.page}>
      <Header />
      <View style={styles.body}>
        <Sidebar projects={allProjects} />
        <View style={styles.main}>
          <Text style={styles.sectionLabel}>Selected Projects</Text>
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </View>
      </View>
      <View style={styles.footer} fixed>
        <Text>fuerst.one</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);
