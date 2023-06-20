import type {Value} from "@/types/Value";

export interface Issue {
  table_name: string
  uuid: string
  num: string
  title: string
  description: string
  spent_time: string
  type_uuid: string
  type_name: string
  workflow_uuid: string
  created_at: string
  updated_at: string
  deleted_at: any
  project_uuid: string
  project_name: string
  project_short_name: string
  values: Value[]
  status_uuid: string
  status_name: string
  sprint_uuid: string
  parent_uuid: any
  sprint_name: string
}