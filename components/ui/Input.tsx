type InputProps = {
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  placeholder,
  type = "text",
  value,
  onChange,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
    />
  );
}