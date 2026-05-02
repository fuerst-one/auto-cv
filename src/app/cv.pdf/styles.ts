import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  ink: "#0a0a0a",
  body: "#1f1f1f",
  muted: "#525252",
  faint: "#a3a3a3",
  divider: "#d4d4d4",
};

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "IBM Plex Mono",
    fontSize: 9.5,
    color: COLORS.body,
    lineHeight: 1.45,
  },

  // Header
  name: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.ink,
    letterSpacing: -0.3,
  },
  roleLine: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: 400,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: COLORS.muted,
  },
  contactLine: {
    marginTop: 4,
    fontSize: 9,
    color: COLORS.muted,
  },
  divider: {
    marginTop: 14,
    marginBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.divider,
  },
  summary: {
    fontSize: 10,
    color: COLORS.body,
    lineHeight: 1.5,
  },

  // Body two-column
  body: {
    marginTop: 18,
    flexDirection: "row",
    gap: 20,
  },
  sidebar: {
    width: 170,
  },
  main: {
    flex: 1,
  },

  // Section labels (used in sidebar + main heading)
  sectionLabel: {
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: COLORS.faint,
    marginBottom: 6,
  },
  sectionGroup: {
    marginBottom: 14,
  },
  sidebarItem: {
    fontSize: 9,
    color: COLORS.body,
    lineHeight: 1.5,
  },

  // Project card
  projectCard: {
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.ink,
  },
  projectMeta: {
    fontSize: 8.5,
    color: COLORS.muted,
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  projectDescription: {
    marginTop: 4,
    fontSize: 9.5,
    color: COLORS.body,
    lineHeight: 1.45,
  },
  projectTools: {
    marginTop: 4,
    fontSize: 8.5,
    color: COLORS.muted,
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: COLORS.faint,
  },
});
