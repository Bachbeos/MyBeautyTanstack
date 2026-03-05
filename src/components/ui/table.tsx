import { clsx, type ClassValue } from "clsx";
import * as React from "react";

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// function Table({ className = "", ...props }: React.ComponentProps<"table">) {
//   return (
//     <div data-slot="table-container" className="table-responsive custom-table">
//       <table
//         data-slot="table"
//         className={`table table-striped table-nowrap align-middle mb-0 ${className}`}
//         {...props}
//       />
//     </div>
//   );
// }
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="table-responsive custom-table">
      <table
        className={cn("table table-striped table-nowrap align-middle mb-0", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className = "", ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={`table-light ${className}`} {...props} />;
}

function TableBody({ className = "", ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableFooter({ className = "", ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={`table-light fw-medium border-top ${className}`}
      {...props}
    />
  );
}

function TableRow({ className = "", ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={className} {...props} />;
}

// function TableHead({ className = "", ...props }: React.ComponentProps<"th">) {
//   return (
//     <th
//       data-slot="table-head"
//       scope="col"
//       className={`text-nowrap align-middle ${className}`}
//       {...props}
//     />
//   );
// }
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("text-nowrap align-middle", className)} {...props} />;
}

// function TableCell({ className = "", ...props }: React.ComponentProps<"td">) {
//   return (
//     <td data-slot="table-cell" className={`text-nowrap align-middle ${className}`} {...props} />
//   );
// }
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("text-nowrap align-middle", className)} {...props} />;
}

function TableCaption({ className = "", ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={`caption-top p-2 text-muted ${className}`}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
