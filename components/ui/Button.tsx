type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
};

export default function Button({ children, type = "button", onClick }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
    >
      {children}
    </button>
  );
}