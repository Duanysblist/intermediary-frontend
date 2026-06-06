import { useState } from 'react'
import { useApplications, useCreateApplication, useUpdateApplication, useDeleteApplication } from './useApplications'
import StatusPill from '../../components/ui/StatusPill'
import Modal from '../../components/ui/Modal'
import ApplicationForm from './ApplicationForm'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatSalary } from '../../lib/format'
import type { Application, ApplicationInput } from '../../types'

export default function ApplicationsPage() {
    const { data, isPending, isError, error } = useApplications()
    const createMut = useCreateApplication()
    const updateMut = useUpdateApplication()
    const deleteMut = useDeleteApplication()

    const [deleting, setDeleting] = useState<Application | null>(null)
    const [adding, setAdding] = useState(false)
    const [editing, setEditing] = useState<Application | null>(null)
    const isOpen = adding || editing !== null

    function close() {
        setAdding(false); setEditing(null); createMut.reset(); updateMut.reset()
    }

    function handleSubmit(input: ApplicationInput) {
        if (editing) updateMut.mutate({ id: editing.id, body: input }, { onSuccess: close })
        else createMut.mutate(input, { onSuccess: close })
    }

    if (isPending) return <p className="text-gray-500">Loading applications…</p>
    if (isError) return <p className="text-red-600">Couldn't load applications: {error.message}</p>

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Applications</h1>
                <button onClick={() => setAdding(true)} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">+ Add</button>
            </div>

            {data.length === 0 ? (
                <p className="text-gray-500">No applications yet.</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="py-2 pr-4 font-medium">Company</th>
                        <th className="py-2 pr-4 font-medium">Role</th>
                        <th className="py-2 pr-4 font-medium">Salary</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Applied</th>
                        <th className="py-2 font-medium"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((app) => (
                        <tr key={app.id} className="border-b border-gray-100">
                            <td className="py-2 pr-4">{app.company}</td>
                            <td className="py-2 pr-4">{app.role}</td>
                            <td className="py-2 pr-4">{formatSalary(app.salaryRangeMin, app.salaryRangeMax)}</td>
                            <td className="py-2 pr-4"><StatusPill status={app.status} /></td>
                            <td className="py-2 pr-4">{app.applicationDate}</td>
                            <td className="py-2 text-right">
                                <button onClick={() => setEditing(app)} className="text-sm text-blue-600">Edit</button>
                                <button onClick={() => setDeleting(app)} className="ml-3 text-sm text-red-600">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <Modal open={isOpen} onClose={close}>
                <ApplicationForm
                    key={editing?.id ?? 'new'}
                    initial={editing ?? undefined}
                    onSubmit={handleSubmit}
                    onCancel={close}
                    isSaving={createMut.isPending || updateMut.isPending}
                    error={createMut.error || updateMut.error}
                />
            </Modal>
            <ConfirmDialog
                open={deleting !== null}
                title="Delete application?"
                message={deleting ? `This permanently removes ${deleting.company} — ${deleting.role}.` : undefined}
                isWorking={deleteMut.isPending}
                onConfirm={() => deleting && deleteMut.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
                onCancel={() => setDeleting(null)}
            />
        </div>
    )
}