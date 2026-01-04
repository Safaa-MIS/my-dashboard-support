import { User } from "@my-dashboard-support/domain";

export interface PagedResponse {
  data: User[];
  total: number;
}
