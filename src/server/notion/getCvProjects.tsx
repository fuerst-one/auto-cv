"use server";

import {
  fetchNotionProjectsDatabase,
  NotionProject,
} from "./fetchNotionProjectsDatabase";
import uniq from "lodash/uniq";
import { NotionClient, fetchNotionClient } from "./fetchNotionClient";
import { fetchNotionContact, NotionContact } from "./fetchNotionContact";
import { RichTextField } from "./types";

export type CvProject = {
  id: string;
  name: string;
  logo: string[] | null;
  description: RichTextField | null;
  status: string;
  featured: boolean;
  projectType: string;
  startDate: string;
  endDate: string | null;
  url: string | null;
  industries: string[];
  experiences: string[];
  tools: string[];
  languages: string[];
  workplace: string | null;
  clients: CvClient[] | null;
  // references: CvContact[];
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
  const projects = await fetchNotionProjectsDatabase();
  const clients = await getClientsFromNotionProjects(projects);
  const contacts = await getContactsFromNotionClients(clients);
  const projectsMerged = mergeProjectData(projects, clients, contacts);
  const projectsSorted = projectsMerged.sort((a, b) => {
    if (a.endDate === null) return -1;
    if (b.endDate === null) return 1;
    return a.endDate < b.endDate ? 1 : -1;
  });
  return projectsSorted;
};

const getClientsFromNotionProjects = async (projects: NotionProject[]) => {
  const clientRelations = projects
    .map((project) => project.Clients)
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

  return projects.map((project) => {
    const mappedClients = project.Clients.map(
      (relation) =>
        clientsWithContacts.find((client) => client.id === relation.id)!,
    );
    return {
      id: project.id,
      name: project.Name,
      logo: project.Logo ?? null,
      description: project["Project Description"],
      status: project.Status,
      featured: project.Featured,
      projectType: project["Project Type"],
      startDate: project["Start Date"],
      endDate: project["End Date"],
      url: project.URL || null,
      industries: project.Industries ?? [],
      experiences: project.Experiences ?? [],
      tools: project.Tools ?? [],
      languages: project.Languages ?? [],
      workplace: project.Workplace || null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      clients: mappedClients.map(({ contacts, ...client }) => client),
      // references: mappedClients.map(({ contacts }) => contacts).flat(),
    };
  });
};