import type { Firestore, WriteBatch } from "firebase/firestore";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import type { Project, WorkLog } from "~/types/project";

type ProjectDocument = Omit<Project, "workLogs"> & {
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

const userProjectWorkLogsCollection = (
  db: Firestore,
  uid: string,
  projectId: string
) => {
  assertPathId(uid, "uid");
  assertPathId(projectId, "projectId");

  return collection(db, "users", uid, "projects", projectId, "workLogs");
};

const userProjectWorkLogDoc = (
  db: Firestore,
  uid: string,
  projectId: string,
  workLogId: string
) => {
  assertPathId(uid, "uid");
  assertPathId(projectId, "projectId");
  assertPathId(workLogId, "workLogId");

  return doc(db, "users", uid, "projects", projectId, "workLogs", workLogId);
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
    workLogs: [],
  };
};

const projectToDocument = (project: Project): ProjectDocument => {
  const { workLogs: _workLogs, ...projectDocument } = project;

  return projectDocument;
};

const workLogToDocument = (workLog: WorkLog) => {
  return Object.fromEntries(
    Object.entries(workLog).filter(([_key, value]) => value !== undefined)
  );
};

const loadRemoteWorkLogs = async (
  db: Firestore,
  uid: string,
  projectId: string
) => {
  const snapshot = await getDocs(userProjectWorkLogsCollection(db, uid, projectId));

  return snapshot.docs
    .map((workLogDoc) => ({
      ...(workLogDoc.data() as Omit<WorkLog, "id">),
      id: workLogDoc.id,
    }))
    .sort((first, second) => {
      return `${first.workDate}-${first.createdAt}`.localeCompare(
        `${second.workDate}-${second.createdAt}`
      );
    });
};

export const loadRemoteProjects = async (db: Firestore, uid: string) => {
  const snapshot = await getDocs(userProjectsCollection(db, uid));

  const projects = snapshot.docs
    .map((projectDoc) => toProject(projectDoc.id, projectDoc.data() as ProjectDocument))
    .sort((first, second) => {
      return String(first.createdAt ?? "").localeCompare(String(second.createdAt ?? ""));
    });

  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      workLogs: await loadRemoteWorkLogs(db, uid, project.id),
    }))
  );
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
      ...projectToDocument(project),
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
          ...projectToDocument(project),
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
  const workLogsSnapshot = await getDocs(userProjectWorkLogsCollection(db, uid, projectId));

  for (let start = 0; start < workLogsSnapshot.docs.length; start += maxBatchWrites) {
    const batch = writeBatch(db);

    workLogsSnapshot.docs.slice(start, start + maxBatchWrites).forEach((workLogDoc) => {
      batch.delete(workLogDoc.ref);
    });

    await batch.commit();
  }

  await deleteDoc(userProjectDoc(db, uid, projectId));
  await touchUser(db, uid);
};

export const saveRemoteWorkLog = async (
  db: Firestore,
  uid: string,
  workLog: WorkLog
) => {
  const updatedAt = new Date().toISOString();
  const batch = writeBatch(db);

  batch.set(
    userProjectWorkLogDoc(db, uid, workLog.projectId, workLog.id),
    {
      ...workLogToDocument(workLog),
      updatedAt: workLog.updatedAt || updatedAt,
    },
    { merge: true }
  );
  touchUserInBatch(batch, db, uid, updatedAt);

  await batch.commit();
};

export const deleteRemoteWorkLog = async (
  db: Firestore,
  uid: string,
  projectId: string,
  workLogId: string
) => {
  const updatedAt = new Date().toISOString();
  const batch = writeBatch(db);

  batch.delete(userProjectWorkLogDoc(db, uid, projectId, workLogId));
  touchUserInBatch(batch, db, uid, updatedAt);

  await batch.commit();
};
