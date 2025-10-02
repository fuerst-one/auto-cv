"use server";

import {
  fetchNotionProjectsDatabase,
  NotionProject,
} from "./fetchNotionProjectsDatabase";
import uniq from "lodash/uniq";
import { NotionClient, fetchNotionClient } from "./fetchNotionClient";
import { fetchNotionContact, NotionContact } from "./fetchNotionContact";
import { RichTextField } from "./types";
import omit from "lodash/omit";

export type CvProject = {
  id: string;
  name: string;
  logo: string[] | null;
  screenshots: string[] | null;
  description: RichTextField;
  kpis: RichTextField;
  wowFactor: number;
  status: string;
  featured: boolean;
  projectType: string;
  startDate: string;
  endDate: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  industries: string[];
  experiences: string[];
  tools: string[];
  languages: string[];
  workplace: string;
  clients: CvClient[];
};

export type CvClient = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  url: string | null;
};

export type CvContact = {
  id: string;
  name: string;
  email: string | null;
  position: string | null;
  knowledge: string[];
};

export const getCvProjects = async () => {
  try {
    const projects = await fetchNotionProjectsDatabase();
    const clients = await getClientsFromNotionProjects(projects);
    const contacts = await getContactsFromNotionClients(clients);
    return mergeProjectData(projects, clients, contacts)
      .sort((a, b) => {
        if (a.endDate === null) return -1;
        if (b.endDate === null) return 1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      })
      .sort((a, b) => {
        return b.wowFactor - a.wowFactor;
      });
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getClientsFromNotionProjects = async (projects: NotionProject[]) => {
  const clientRelations = projects
    .map((project) => project.clients)
    .flat()
    .filter(Boolean);
  const clientIds = uniq(clientRelations.map((relation) => relation.id));
  const clients = await Promise.all(clientIds.map(fetchNotionClient));
  return clients;
};

const getContactsFromNotionClients = async (clients: NotionClient[]) => {
  const contactRelations = clients
    .map((client) => client.Contacts)
    .flat()
    .filter(Boolean);
  const contactIds = uniq(contactRelations.map((relation) => relation.id));
  const contacts = await Promise.all(contactIds.map(fetchNotionContact));
  return contacts;
};

const mergeProjectData = (
  projects: NotionProject[],
  clients: NotionClient[],
  contacts: NotionContact[],
): CvProject[] => {
  const cvContacts = contacts.map((contact) => ({
    id: contact.id,
    name: contact["Name 1"] ?? "Unknown",
    email: contact.Email || null,
    position: contact.Position || null,
    knowledge: contact.Knowledge ?? [],
  }));

  const clientsWithContacts: (CvClient & { contacts: CvContact[] })[] =
    clients.map((client) => {
      const contacts = client.Contacts.map(
        (relation) => cvContacts.find((client) => client.id === relation.id)!,
      );
      return {
        id: client.id,
        name: client.Name,
        email: client.Email || null,
        address: client.Address || null,
        url: client.URL || null,
        contacts,
      };
    });

  const filteredProjects = projects.filter((project) => !project.hidden);

  return filteredProjects.map((project) => {
    const mappedClients = project.clients.map(
      (relation) =>
        clientsWithContacts.find((client) => client.id === relation.id)!,
    );
    return {
      ...project,
      clients: mappedClients.map((client) => omit(client, ["contacts"])),
    };
  });
};
