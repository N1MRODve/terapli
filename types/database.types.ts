export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pacientes: {
        Row: {
          id: string
          email: string
          nombre: string
          telefono: string | null
          notas_iniciales: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          telefono?: string | null
          notas_iniciales?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          telefono?: string | null
          notas_iniciales?: string | null
          created_at?: string
        }
        Relationships: []
      }
      bonos: {
        Row: {
          id: string
          paciente_id: string
          sesiones_totales: number
          sesiones_usadas: number
          precio: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          sesiones_totales?: number
          sesiones_usadas?: number
          precio?: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          sesiones_totales?: number
          sesiones_usadas?: number
          precio?: number
          activo?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          }
        ]
      }
      sesiones: {
        Row: {
          id: string
          paciente_id: string
          bono_id: string | null
          fecha: string
          estado: string
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          bono_id?: string | null
          fecha: string
          estado?: string
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          bono_id?: string | null
          fecha?: string
          estado?: string
          notas?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sesiones_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sesiones_bono_id_fkey"
            columns: ["bono_id"]
            isOneToOne: false
            referencedRelation: "bonos"
            referencedColumns: ["id"]
          }
        ]
      }
      pagos: {
        Row: {
          id: string
          paciente_id: string
          bono_id: string | null
          monto: number
          metodo: string
          estado: string
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          bono_id?: string | null
          monto?: number
          metodo?: string
          estado?: string
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          bono_id?: string | null
          monto?: number
          metodo?: string
          estado?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_bono_id_fkey"
            columns: ["bono_id"]
            isOneToOne: false
            referencedRelation: "bonos"
            referencedColumns: ["id"]
          }
        ]
      }
      recursos: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          url: string
          tipo: string
          publico: boolean
          created_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          url: string
          tipo?: string
          publico?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          url?: string
          tipo?: string
          publico?: boolean
          created_at?: string
        }
        Relationships: []
      }
      mensajes: {
        Row: {
          id: string
          paciente_id: string
          contenido: string
          de_psicologa: boolean
          leido: boolean
          created_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          contenido: string
          de_psicologa?: boolean
          leido?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          contenido?: string
          de_psicologa?: boolean
          leido?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
