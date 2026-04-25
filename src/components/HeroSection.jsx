export default function HeroSection({ title, subtitle }) {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}