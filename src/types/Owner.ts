import type {Role} from "@/types/Role";

export interface Owner {
  mail: string
  name: string
  uuid: string
  login: string
  roles: Role[]
  token: string
  active: boolean
  avatar: string
  discord: string
  password: string
  telegram: string
  created_at: string
  deleted_at: any
  table_name: string
  updated_at: string
  token_created_at: string
}