import { ProductStatus } from "../../app/types/product";

export default function StatusBadge({ status }: { status: ProductStatus }) {
  const styles = {
    pending: "bg-yellow-500/20 text-yellow-300",
    approved: "bg-green-500/20 text-green-300",
    rejected: "bg-red-500/20 text-red-300",
    correction: "bg-blue-500/20 text-blue-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${styles[status]}`}>
      {status}
    </span>
  );
}