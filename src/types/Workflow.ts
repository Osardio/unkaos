import type {Transition} from "@/types/Transition";
import type {WorkflowNode} from "@/types/WorkflowNode";

export interface Workflow {
  table_name: string
  uuid: string
  created_at: string
  name: string
  deleted_at: any
  updated_at: string
  transitions: Transition[]
  workflow_nodes: WorkflowNode[]
}