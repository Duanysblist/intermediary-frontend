/**
 * The column's ids after dropping `id` on the card `overId` (or on the column itself when undefined).
 * Within one column the card takes the dropped-on card's place; from another column it goes before it.
 * Dropping on the column puts it at the end.
 */
export function placeInColumn(columnIds: number[], id: number, overId?: number): number[] {
    if (overId === id) return columnIds
    const rest = columnIds.filter((x) => x !== id)
    if (overId === undefined) return [...rest, id]
    const to = columnIds.includes(id) ? columnIds.indexOf(overId) : rest.indexOf(overId)
    return [...rest.slice(0, to), id, ...rest.slice(to)]
}
