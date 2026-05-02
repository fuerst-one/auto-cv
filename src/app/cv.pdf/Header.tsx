import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";

export const Header = () => (
  <View>
    <Text style={styles.name}>Alexander Fürst</Text>
    <Text style={styles.roleLine}>
      UX+AI Engineer · Würzburg, DE · 8+ years
    </Text>
    <Text style={styles.contactLine}>
      alexander@fuerst.one · linkedin.com/in/fuerst-one · github.com/fuerst-one
    </Text>
    <View style={styles.divider} />
    <Text style={styles.summary}>
      From idea to app to automation to production. Engineering intuitive
      interfaces for complex, tailor-fit tools — backed by full-stack AI
      development, behavioral psychology, user research, and CRO.
    </Text>
  </View>
);
