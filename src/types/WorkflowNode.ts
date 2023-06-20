import type {WorkflowNodeStatus} from "@/types/WorkflowNodeStatus";

export interface WorkflowNode {
  x: number
  y: number
  uuid: string
  created_at: string
  deleted_at: any
  table_name: string
  updated_at: string
  issue_statuses: WorkflowNodeStatus[]
  workflows_uuid: string
  issue_statuses_uuid: string
}