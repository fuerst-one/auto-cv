import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { CvOwner } from "@/server/notion/getCvOwner";

const formatHeaderLocation = (owner: CvOwner): string => {
  const { city, country } = owner.address;
  return [city, country].filter(Boolean).join(", ");
};

export const Header = ({ owner }: { owner: CvOwner }) => (
  <View>
    <Text style={styles.name}>{owner.name}</Text>
    <Text style={styles.roleLine}>
      UX+AI Engineer · {formatHeaderLocation(owner)} · 8+ years
    </Text>
    <Text style={styles.contactLine}>
      {owner.email} · linkedin.com/in/fuerst-one · github.com/fuerst-one
    </Text>
    <View style={styles.divider} />
    <Text style={styles.summary}>
      From idea to app to automation to production. Engineering intuitive
      interfaces for complex, tailor-fit tools — backed by full-stack AI
      development, behavioral psychology, user research, and CRO.
    </Text>
  </View>
);
