import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

const VARIANT: Record<Variant, string> = {
    primary: 'bg-accent text-on-accent hover:bg-accent-strong focus-visible:ring-focus/40',
    secondary: 'border border-rule-strong bg-surface text-ink-2 hover:bg-page focus-visible:ring-rule-strong/40',
    danger: 'bg-danger text-white hover:bg-danger-strong focus-visible:ring-danger/40',
    ghost: 'text-ink-2 hover:bg-sunken hover:text-ink focus-visible:ring-rule-strong/40',
}
const SIZE: Record<Size, string> = {
    // Phone sizes meet a 44px touch target; pointer screens get the denser desktop sizes.
    sm: 'min-h-9 px-3 text-sm sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-xs',
    md: 'min-h-11 px-4 text-[15px] sm:min-h-0 sm:px-3.5 sm:py-2 sm:text-sm',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: Props) {
    return (
        <button
            type={type}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors ` +
                `focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ` +
                `${VARIANT[variant]} ${SIZE[size]} ${className}`}
            {...rest}
        />
    )
}
