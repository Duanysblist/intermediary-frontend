import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fitnessSessionsApi, planItemsApi, studySessionsApi } from '../../api/resources'
import { PLAN_EVENTS_KEY, fitnessSessions, planItems, studySessions } from '../../hooks/resources'
import { toInput } from './usePlanBoard'
import Field, { inputClass } from '../../components/ui/Field'
import Button from '../../components/ui/Button'
import { toDateTimeLocal } from '../../lib/format'
import { WORKOUT_TYPES, label, type PlanItem, type WorkoutType } from '../../types'

type Props = { item: PlanItem; onDone: () => void; onCancel: () => void }

/**
 * "Done, log 45 min": creates the study or fitness session that fulfilled a plan item, linked
 * back to it, then marks the item DONE. Study items that reference a certification carry it over.
 */
export default function LogSessionForm({ item, onDone, onCancel }: Props) {
    const qc = useQueryClient()
    const kind: 'study' | 'fitness' = item.intent === 'EXERCISE' ? 'fitness' : 'study'
    const [when, setWhen] = useState(() => { const d = new Date(); d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0); return toDateTimeLocal(d) })
    const [minutes, setMinutes] = useState(kind === 'fitness' ? 45 : 60)
    const [workoutType, setWorkoutType] = useState<WorkoutType>('WORKOUT_A')
    const [notes, setNotes] = useState('')
    const [markDone, setMarkDone] = useState(true)

    const mut = useMutation({
        mutationFn: async () => {
            if (kind === 'fitness') {
                await fitnessSessionsApi.create({ sessionDate: when, durationMinutes: minutes, workoutType, planItemId: item.id, notes: notes.trim() || null })
            } else {
                await studySessionsApi.create({
                    sessionDate: when, durationMinutes: minutes, planItemId: item.id, notes: notes.trim() || null,
                    certificationId: item.referenceEntityType === 'CERTIFICATION' ? item.referenceEntityId : null,
                })
            }
            if (markDone && item.status !== 'DONE') await planItemsApi.update(item.id, { ...toInput(item), status: 'DONE' })
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: kind === 'fitness' ? fitnessSessions.queryKey : studySessions.queryKey })
            qc.invalidateQueries({ queryKey: planItems.queryKey })
            qc.invalidateQueries({ queryKey: [PLAN_EVENTS_KEY] })
            onDone()
        },
    })

    function submit(e: FormEvent) { e.preventDefault(); mut.mutate() }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Log what happened</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                    Records a {kind === 'fitness' ? 'workout' : 'study session'} for “{item.title}”
                    {item.referenceEntityType === 'CERTIFICATION' && kind === 'study' ? ', linked to its certification' : ''}.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="When" required>
                    <input type="datetime-local" className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} required autoFocus />
                </Field>
                <Field label="Duration (minutes)" required>
                    <input type="number" min={1} className={inputClass} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} required />
                </Field>
                {kind === 'fitness' && (
                    <Field label="Workout type" required className="sm:col-span-2">
                        <select className={inputClass} value={workoutType} onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}>
                            {WORKOUT_TYPES.map((w) => <option key={w} value={w}>{label(w)}</option>)}
                        </select>
                    </Field>
                )}
                <Field label="Notes" className="sm:col-span-2">
                    <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you cover?" />
                </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={markDone} onChange={(e) => setMarkDone(e.target.checked)} />
                Mark the plan item as done
            </label>
            {mut.isError && <p className="text-sm text-red-600">{mut.error.message}</p>}
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onCancel}>Back</Button>
                <Button type="submit" disabled={mut.isPending}>{mut.isPending ? 'Saving…' : 'Log it'}</Button>
            </div>
        </form>
    )
}
