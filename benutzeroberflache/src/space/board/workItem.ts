export enum State {
  TO_DO = "TO_DO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface WorkItem {
  id: string;
  title: string;
  riskLevel: number;
  state: State;
}
