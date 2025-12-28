declare module "@material-tailwind/react" {
  import { ReactNode, ComponentProps } from "react";

  export interface ButtonProps extends Partial<ComponentProps<"button">> {
    variant?: "filled" | "outlined" | "gradient" | "text";
    size?: "sm" | "md" | "lg";
    color?: "blue" | "red" | "green" | "purple" | "amber" | "gray" | "blue-gray";
    fullWidth?: boolean;
    ripple?: boolean;
    className?: string;
    children?: ReactNode;
  }

  export interface CardProps extends Partial<ComponentProps<"div">> {
    variant?: "filled" | "gradient";
    color?: "transparent" | "white" | "blue-gray" | "gray" | "brown" | "deep-orange" | "orange" | "amber" | "yellow" | "lime" | "light-green" | "green" | "teal" | "cyan" | "light-blue" | "blue" | "indigo" | "deep-purple" | "purple" | "pink" | "red";
    shadow?: boolean;
    className?: string;
    children?: ReactNode;
  }

  export interface TypographyProps extends Partial<ComponentProps<"p">> {
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "lead" | "paragraph" | "small";
    color?: "inherit" | "current" | "black" | "white" | "blue-gray" | "gray" | "brown" | "deep-orange" | "orange" | "amber" | "yellow" | "lime" | "light-green" | "green" | "teal" | "cyan" | "light-blue" | "blue" | "indigo" | "deep-purple" | "purple" | "pink" | "red";
    as?: any;
    className?: string;
    children?: ReactNode;
  }

  export interface CheckboxProps extends Partial<ComponentProps<"input">> {
    color?: "blue" | "red" | "green" | "purple" | "amber" | "gray" | "blue-gray";
    label?: ReactNode;
    ripple?: boolean;
    className?: string;
    containerProps?: Record<string, any>;
    labelProps?: Record<string, any>;
  }

  export interface TextareaProps extends Partial<ComponentProps<"textarea">> {
    variant?: "outlined" | "standard" | "static";
    size?: "md" | "lg";
    color?: "blue" | "red" | "green" | "purple" | "amber" | "gray" | "blue-gray";
    label?: string;
    error?: boolean;
    success?: boolean;
    resize?: boolean;
    labelProps?: Record<string, any>;
    containerProps?: Record<string, any>;
    className?: string;
  }

  export interface ChipProps extends Partial<ComponentProps<"div">> {
    variant?: "filled" | "gradient" | "outlined" | "ghost";
    size?: "sm" | "md" | "lg";
    color?: "blue" | "red" | "green" | "purple" | "amber" | "gray" | "blue-gray";
    value?: ReactNode;
    icon?: ReactNode;
    open?: boolean;
    onClose?: () => void;
    className?: string;
  }

  export interface NavbarProps extends Partial<ComponentProps<"nav">> {
    variant?: "filled" | "gradient";
    color?: "transparent" | "white" | "blue-gray" | "blue" | "red" | "green" | "purple" | "amber" | "gray";
    shadow?: boolean;
    blurred?: boolean;
    fullWidth?: boolean;
    className?: string;
    children?: ReactNode;
  }

  export interface IconButtonProps extends Partial<ComponentProps<"button">> {
    variant?: "filled" | "outlined" | "gradient" | "text";
    size?: "sm" | "md" | "lg";
    color?: "blue" | "red" | "green" | "purple" | "amber" | "gray" | "blue-gray";
    ripple?: boolean;
    className?: string;
    children?: ReactNode;
  }

  export interface SpinnerProps extends Partial<ComponentProps<"svg">> {
    color?: "blue" | "red" | "green" | "purple" | "amber" | "gray" | "blue-gray";
    className?: string;
  }

  export const Button: React.FC<ButtonProps>;
  export const Card: React.FC<CardProps>;
  export const Typography: React.FC<TypographyProps>;
  export const Checkbox: React.FC<CheckboxProps>;
  export const Textarea: React.FC<TextareaProps>;
  export const Chip: React.FC<ChipProps>;
  export const Navbar: React.FC<NavbarProps>;
  export const IconButton: React.FC<IconButtonProps>;
  export const Spinner: React.FC<SpinnerProps>;
  export const ThemeProvider: React.FC<{ children: ReactNode }>;
}
