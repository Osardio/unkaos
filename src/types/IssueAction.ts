export interface IssueAction {
  uuid: string
  issue_uuid: string
  author: string
  author_uuid: string
  value: string
  name: string
  created_at: string
  archived_at?: string
}