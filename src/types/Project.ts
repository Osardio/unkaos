import type {Owner} from "@/types/Owner";

export interface Project {
  table_name: string
  description: string
  avatar: any
  deleted_at: any
  updated_at: string
  created_at: string
  owner_uuid: string
  owner: Owner[]
  uuid: string
  name: string
  short_name: string
}