import type {IssueFieldType} from "@/types/IssueFieldType";

export interface IssueField {
  name: string
  type: IssueFieldType[]
  uuid: string
  is_custom: boolean
  max_value: any
  min_value: any
  presision: any
  type_uuid: string
  created_at: string
  deleted_at: any
  table_name: string
  updated_at: string
  available_values?: string
}