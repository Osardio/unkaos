export interface WorkflowNodeStatus {
  name: string
  uuid: string
  is_end?: boolean
  is_start?: boolean
  created_at: string
  deleted_at: any
  table_name: string
  updated_at: string
}