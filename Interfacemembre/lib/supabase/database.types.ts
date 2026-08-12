export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          role: 'member' | 'pole_lead' | 'admin'
          pole_id: string | null
          points_total: number
          year: string | null
        }
        Insert: { id: string } & Partial<Database['public']['Tables']['profiles']['Row']>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: [
          {
            foreignKeyName: 'profiles_pole_id_fkey'
            columns: ['pole_id']
            isOneToOne: false
            referencedRelation: 'poles'
            referencedColumns: ['id']
          }
        ]
      }
      poles: {
        Row: { id: string; name: string; slug: string }
        Insert: Partial<Database['public']['Tables']['poles']['Row']>
        Update: Partial<Database['public']['Tables']['poles']['Row']>
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          title: string
          type: 'event' | 'visit' | 'formation'
          description: string | null
          date_start: string
          date_end: string | null
          location: string | null
          capacity: number | null
          pole_id: string | null
          prerequisites: string | null
          recap_url: string | null
          training_material_url: string | null
          trainer_name: string | null
        }
        Insert: Partial<Database['public']['Tables']['activities']['Row']>
        Update: Partial<Database['public']['Tables']['activities']['Row']>
        Relationships: []
      }
      event_registrations: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          status: 'confirmed' | 'waitlisted'
          queue_position: number | null
          attended: boolean | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['event_registrations']['Row']>
        Update: Partial<Database['public']['Tables']['event_registrations']['Row']>
        Relationships: [
          {
            foreignKeyName: 'event_registrations_activity_id_fkey'
            columns: ['activity_id']
            isOneToOne: false
            referencedRelation: 'activities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_registrations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      projects: {
        Row: {
          id: string
          title: string
          lead_id: string | null
          deadline: string | null
          pole_id: string | null
          progress: number
          status: 'todo' | 'in_progress' | 'done'
        }
        Insert: Partial<Database['public']['Tables']['projects']['Row']>
        Update: Partial<Database['public']['Tables']['projects']['Row']>
        Relationships: [
          {
            foreignKeyName: 'projects_pole_id_fkey'
            columns: ['pole_id']
            isOneToOne: false
            referencedRelation: 'poles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'projects_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
        }
        Insert: Partial<Database['public']['Tables']['project_members']['Row']>
        Update: Partial<Database['public']['Tables']['project_members']['Row']>
        Relationships: [
          {
            foreignKeyName: 'project_members_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      project_tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          status: 'todo' | 'in_progress' | 'done'
          assignee_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['project_tasks']['Row']>
        Update: Partial<Database['public']['Tables']['project_tasks']['Row']>
        Relationships: [
          {
            foreignKeyName: 'project_tasks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_tasks_assignee_id_fkey'
            columns: ['assignee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string | null
          excerpt: string | null
          pinned: boolean
          created_at: string
          pole_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['announcements']['Row']>
        Update: Partial<Database['public']['Tables']['announcements']['Row']>
        Relationships: [
          {
            foreignKeyName: 'announcements_pole_id_fkey'
            columns: ['pole_id']
            isOneToOne: false
            referencedRelation: 'poles'
            referencedColumns: ['id']
          }
        ]
      }
      resources: {
        Row: {
          id: string
          title: string
          file_url: string
          category: string | null
          pole_id: string | null
        }
        Insert: Partial<Database['public']['Tables']['resources']['Row']>
        Update: Partial<Database['public']['Tables']['resources']['Row']>
        Relationships: [
          {
            foreignKeyName: 'resources_pole_id_fkey'
            columns: ['pole_id']
            isOneToOne: false
            referencedRelation: 'poles'
            referencedColumns: ['id']
          }
        ]
      }
      points_log: {
        Row: {
          id: string
          user_id: string
          reason: string
          amount: number
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['points_log']['Row']>
        Update: Partial<Database['public']['Tables']['points_log']['Row']>
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          user_id: string
          first_name: string | null
          last_name: string | null
          points_total: number
          rank: number
          pole_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      register_to_activity: { Args: { p_activity_id: string }; Returns: undefined }
      cancel_registration: { Args: { p_registration_id: string }; Returns: undefined }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
