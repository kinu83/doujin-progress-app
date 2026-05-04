export type WorkProcessStep = {
  name: string;
  minutesPerPage: number;
};

export type WorkProcess = {
  id: string;
  name: string;
  steps: WorkProcessStep[];
};

export type AppSettings = {
  defaultTotalPages: number;
  defaultWorkProcessId: string;
  workProcesses: WorkProcess[];
};
