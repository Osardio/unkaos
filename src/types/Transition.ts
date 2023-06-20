export interface Transition {
  name: string
  uuid: string
  created_at: string
  deleted_at: any
  table_name: string
  updated_at: string
  status_to_uuid: string
  workflows_uuid: string
  status_from_uuid: string
}