export interface Credentials {
  username: string;
  password: string;
}

export interface User {
  username: string;
}

export interface Team {
  id: number;
  name: string;
  members: string[];
  points: number;
  rank?: null | number;
  change?: null | number;
}

export interface TeamsData {
  teams: Team[];
}

export interface TeamData {
  id: number;
  name: string;
  members: string[];
  weeks: WeekPoints[];
  rank: number;
  change?: null | number;
}

export interface WeekPoints {
  week: number;
  points: number;
  metrics?: Metrics;
}

export interface Metrics {
  req_vola?: number;
  no_pg_spec?: number;
  size_standard?: nummber;
  design_faults?: number;
}
