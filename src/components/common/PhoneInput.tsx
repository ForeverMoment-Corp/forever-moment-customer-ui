import type { InputHTMLAttributes } from 'react';
import { COUNTRY_CODE, toLocalDigits } from '@/lib/phone';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
    /** The 10 local digits (without +91). */
    value: string;
    onChange: (digits: string) => void;
    invalid?: boolean;
    /** Classes for the outer box (height, radius) so it matches the form's other fields. */
    boxClassName?: string;
}

/** Phone field with a fixed "+91" in front; only the 10-digit mobile number is typed. */
export default function PhoneInput({ value, onChange, invalid = false, boxClassName = 'h-11 rounded-xl', className = '', ...rest }: PhoneInputProps) {
    return (
        <div
            className={`flex w-full items-stretch overflow-hidden border bg-white transition-colors focus-within:border-[var(--burgundy)] ${
                invalid ? 'border-[var(--rose)]' : 'border-[var(--border-light)]'
            } ${boxClassName}`}
        >
            <span
                aria-hidden="true"
                className="flex shrink-0 items-center border-r border-[var(--border-light)] bg-[var(--cream)] px-3 text-[0.88rem] font-medium text-[var(--charcoal)]"
            >
                {COUNTRY_CODE}
            </span>
            <input
                {...rest}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={14}
                value={value}
                onChange={(e) => onChange(toLocalDigits(e.target.value))}
                aria-invalid={invalid || undefined}
                className={`min-w-0 flex-1 bg-transparent px-3 text-[0.9rem] text-[var(--charcoal)] outline-none placeholder:text-[var(--mid)]/70 ${className}`}
            />
        </div>
    );
}
