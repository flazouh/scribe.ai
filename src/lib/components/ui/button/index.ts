import { type VariantProps, tv } from "tailwind-variants";
import type { Button as ButtonPrimitive } from "bits-ui";
import Root from "./button.svelte";

const buttonVariants = tv({
	base: "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	variants: {
		variant: {
			"border-dashed":
				"border border-dashed border-setting-item hover:border-violet-500 flex items-center justify-center gap-2 px-2 py-1 cursor-pointer",
			"bg-gradient":
				"pro-button-bordered-highlight bg-gradient-to-r from-pro-turquoise to-pro-purple flex cursor-pointer font-fluent items-center justify-center rounded-lg px-3 py-2 text-center text-white ",
			"border-gradient":
				"border-gradient-br-turquoise-purple-background gradient-border-1  relative overflow-hidden before:absolute before:inset-0 before:opacity-0 before:bg-gradient-to-r before:from-turquoise before:to-purple before:blur-lg hover:before:opacity-70 before:transition-opacity before:duration-300",
			default: "bg-setting-item hover:bg-setting-item/90 ",
			destructive: "bg-red-900 text-white hover:bg-red-900/90",
			outline: "border border-setting-item bg-background hover:bg-background/90",
			secondary: "bg-slate-800 text-white hover:bg-slate-800/80",
			ghost: "bg-transparent hover:bg-secondary hover:text-slate-50",
			link: "text-white underline-offset-4 hover:underline",
			"purple-border": "border border-transparent bg-setting-item-hover hover:border-purple-leo",
			border:
				"border border-setting-item hover:border-violet-500 flex items-center justify-center gap-2 px-2 py-1 cursor-pointer",
		},
		size: {
			default: "h-10 px-2 py-1",
			sm: "h-9 rounded-md px-3",
			lg: "h-11 rounded-md px-8",
			icon: "size-10",
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
});

type Variant = VariantProps<typeof buttonVariants>["variant"];
type Size = VariantProps<typeof buttonVariants>["size"];

type Props = ButtonPrimitive.Props & {
	variant?: Variant;
	size?: Size;
};

type Events = ButtonPrimitive.Events;

export {
	Root,
	type Props,
	type Events,
	//
	Root as Button,
	type Props as ButtonProps,
	type Events as ButtonEvents,
	buttonVariants,
};
