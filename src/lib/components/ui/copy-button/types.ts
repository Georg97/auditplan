import type { Snippet } from 'svelte';
import type { ButtonVariant, ButtonSize } from '$lib/components/ui/button';
import type { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { WithChildren, WithoutChildren } from 'bits-ui';

export type CopyButtonPropsWithoutHTML = WithChildren<{
	variant?: ButtonVariant;
	size?: ButtonSize;
	ref?: HTMLButtonElement | null;
	text: string;
	icon?: Snippet<[]>;
	animationDuration?: number;
	onCopy?: (status: UseClipboard['status']) => void;
}>;

export type CopyButtonProps = CopyButtonPropsWithoutHTML & WithoutChildren<HTMLAttributes<HTMLButtonElement>>;
