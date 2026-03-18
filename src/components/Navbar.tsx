import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-30 bg-white border-b border-gray-100 flex items-center justify-center px-6">
      <Link to="/">
        <img
          src="/logo-vert-nom.png"
          alt="Promptly"
          className="h-24 w-auto object-contain"
        />
      </Link>
    </nav>
  );
}
