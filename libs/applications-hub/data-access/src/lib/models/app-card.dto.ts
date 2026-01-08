export interface AppCardDto {
  id: string;
  name: string;
  route?: string;
  description?: string;
  icon?: string;
  permissions?: string[];
}