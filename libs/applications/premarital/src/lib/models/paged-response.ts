import { User } from "../interfaces/User";

export interface PagedResponse {
  data: User[];
  total: number;
}
