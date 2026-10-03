import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { getCategoryIcon } from "./navTypes";

/** Renders the lucide icon matched to a category or sub-category name. */
const CategoryIcon = ({ name, ...props }: { name: string } & LucideProps) =>
  createElement(getCategoryIcon(name), props);

export default CategoryIcon;
