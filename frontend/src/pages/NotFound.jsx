import { Link } from "react-router-dom";
import { AlertOctagon, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="container mt-5 text-center py-5">
      <AlertOctagon size={56} className="text-danger mb-3" />
      <h1 className="fw-bold">404</h1>
      <p className="text-muted">Page not found.</p>
      <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2 mt-2">
        <ArrowLeft size={18} />
        <span>Go back home</span>
      </Link>
    </div>
  );
}

export default NotFound;