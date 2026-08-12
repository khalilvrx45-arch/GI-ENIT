'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { GripVertical, UserRound } from 'lucide-react'

type Task = Database['public']['Tables']['project_tasks']['Row']

type Props = {
  projectId: string
  initialTasks: Task[]
  isMember: boolean
}

const COLUMNS = [
  { id: 'todo', label: 'À faire' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'done', label: 'Terminé' },
] as const

function TaskCard({ task, isMember }: { task: Task; isMember: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !isMember,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-bg border border-card p-3 rounded-sm hover:border-accent/30 transition-colors flex items-start gap-2 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      {isMember && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Déplacer la tâche : ${task.title}`}
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted/60 hover:text-accent active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text font-body">{task.title}</p>
        {task.assignee_id && (
          <div className="mt-2 flex items-center justify-end gap-1 text-muted">
            <UserRound className="h-3 w-3" aria-hidden="true" />
            <span className="text-xs font-mono">Assigné</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Column({
  id,
  label,
  tasks,
  isMember,
}: {
  id: string
  label: string
  tasks: Task[]
  isMember: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`bg-card/50 border rounded-md p-3 min-w-[80vw] md:min-w-0 snap-center md:snap-none flex flex-col transition-colors ${
        isOver ? 'border-accent/50 bg-accent/5' : 'border-card'
      }`}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-muted/10">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted">{label}</h3>
        <span className="text-xs font-mono text-muted bg-bg px-2 py-0.5 rounded-sm">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[100px]">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <TaskCard task={task} isMember={isMember} />
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-xs text-muted/50 italic py-4">
              Glisse une tâche ici
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function KanbanBoard({ projectId, initialTasks, isMember }: Props) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Capteurs : souris/trackpad, tactile (mobile/tablette) et clavier (accessibilité)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Realtime : écouter les changements de tâches
  useEffect(() => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_tasks', filter: `project_id=eq.${projectId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t))
          } else if (payload.eventType === 'INSERT') {
            setTasks(prev => prev.some(t => t.id === payload.new.id) ? prev : [...prev, payload.new as Task])
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, supabase])

  const columnIds = useMemo(() => COLUMNS.map((c) => c.id as string), [])

  const commitStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // UI optimiste
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t)))

    const { error } = await supabase
      .from('project_tasks')
      .update({ status: newStatus as Task['status'] })
      .eq('id', taskId)

    if (error) {
      // Rollback
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)))
      console.error('Erreur de déplacement', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    // La zone survolée peut être une colonne (id direct) ou une autre tâche (on remonte à sa colonne)
    const overId = over.id as string
    const targetStatus = columnIds.includes(overId)
      ? overId
      : tasks.find((t) => t.id === overId)?.status

    if (targetStatus) {
      commitStatusChange(active.id as string, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            label={col.label}
            tasks={tasks.filter((t) => t.status === col.id)}
            isMember={isMember}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-bg border border-accent/50 shadow-gold-glow p-3 rounded-sm rotate-2">
            <p className="text-sm text-text font-body">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
