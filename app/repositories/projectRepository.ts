import type { Firestore, WriteBatch } from "firebase/firestore";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import type { Project } from "~/types/project";

type ProjectDocument = Project & {
  updatedAt?: string;
};

const maxBatchWrites = 450;

const assertPathId = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`${label} is required.`);
  }
};

const userDoc = (db: Firestore, uid: string) => {
  assertPathId(uid, "uid");

  return doc(db, "users", uid);
};

const userProjectsCollection = (db: Firestore, uid: string) => {
  assertPathId(uid, "uid");

  return collection(db, "users", uid, "projects");
};

const userProjectDoc = (db: Firestore, uid: string, projectId: string) => {
  assertPathId(uid, "uid");
  assertPathId(projectId, "projectId");

  return doc(db, "users", uid, "projects", projectId);
};

const touchUser = async (db: Firestore, uid: string, updatedAt = new Date().toISOString()) => {
  await setDoc(userDoc(db, uid), { updatedAt }, { merge: true });
};

const touchUserInBatch = (
  batch: WriteBatch,
  db: Firestore,
  uid: string,
  updatedAt: string
) => {
  batch.set(userDoc(db, uid), { updatedAt }, { merge: true });
};

const toProject = (projectId: string, data: ProjectDocument): Project => {
  return {
    ...data,
    id: projectId,
  };
};

export const loadRemoteProjects = async (db: Firestore, uid: string) => {
  const snapshot = await getDocs(userProjectsCollection(db, uid));

  return snapshot.docs
    .map((projectDoc) => toProject(projectDoc.id, projectDoc.data() as ProjectDocument))
    .sort((first, second) => {
      return String(first.createdAt ?? "").localeCompare(String(second.createdAt ?? ""));
    });
};

export const saveRemoteProject = async (
  db: Firestore,
  uid: string,
  project: Project
) => {
  assertPathId(project.id, "project.id");

  const updatedAt = new Date().toISOString();
  const batch = writeBatch(db);

  batch.set(
    userProjectDoc(db, uid, project.id),
    {
      ...project,
      updatedAt,
    },
    { merge: true }
  );
  touchUserInBatch(batch, db, uid, updatedAt);

  await batch.commit();
};

export const saveRemoteProjects = async (
  db: Firestore,
  uid: string,
  projects: Project[]
) => {
  const updatedAt = new Date().toISOString();

  if (projects.length === 0) {
    await touchUser(db, uid, updatedAt);
    return;
  }

  for (let start = 0; start < projects.length; start += maxBatchWrites) {
    const projectChunk = projects.slice(start, start + maxBatchWrites);
    const batch = writeBatch(db);

    projectChunk.forEach((project) => {
      assertPathId(project.id, "project.id");
      batch.set(
        userProjectDoc(db, uid, project.id),
        {
          ...project,
          updatedAt,
        },
        { merge: true }
      );
    });

    touchUserInBatch(batch, db, uid, updatedAt);
    await batch.commit();
  }
};

export const deleteRemoteProject = async (
  db: Firestore,
  uid: string,
  projectId: string
) => {
  await deleteDoc(userProjectDoc(db, uid, projectId));
  await touchUser(db, uid);
};
