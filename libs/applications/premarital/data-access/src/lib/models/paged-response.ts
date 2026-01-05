import { User } from "@my-dashboard-support/shared/domain";

export interface PagedResponse {
  data: User[];
  total: number;
}
