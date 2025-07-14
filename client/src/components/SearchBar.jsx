export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <input
      className="block w-full border px-3 py-2 rounded mb-4"
      placeholder={placeholder || "Search..."}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}
