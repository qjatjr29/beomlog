import * as React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({ className = "", ...props }: TextareaProps) => (
  <textarea
    className={`flex min-h-16 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blog-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none ${className}`}
    {...props}
  />
);
