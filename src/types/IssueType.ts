import type {Workflow} from "@/types/Workflow";
import type {IssueField} from "@/types/IssueField";

export interface IssueType {
  table_name: string
  uuid: string
  workflow_uuid: string
  workflow: Workflow[]
  created_at: string
  updated_at: string
  deleted_at: any
  name: string
  fields: IssueField[]
}