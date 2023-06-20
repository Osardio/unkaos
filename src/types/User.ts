import type {UserRole} from "@/types/UserRole";

export interface User {
  table_name: string
  name: string
  discord: string
  password: string
  active: boolean
  uuid: string
  avatar?: string
  telegram: string
  created_at: string
  updated_at: string
  token?: string
  mail: string
  login: string
  deleted_at: any
  token_created_at?: string
  roles: UserRole[]
}

