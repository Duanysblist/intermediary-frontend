import Pill from './Pill'
import type { ApplicationStatus } from '../../types'

export default function StatusPill({ status }: { status: ApplicationStatus }) {
    return <Pill value={status} />
}
