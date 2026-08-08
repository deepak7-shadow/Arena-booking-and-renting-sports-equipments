import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dashboardPath = {
  customer: '/dashboard',
  arena_owner: '/owner',
  admin: '/admin',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-court-line bg-court-bg/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl tracking-tight text-court-primary">
          Arena<span className="text-court-accent-dark">Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/search" className="hover:text-court-primary transition-colors">Find an arena</Link>
          {user && (
            <Link to={dashboardPath[user.role]} className="hover:text-court-primary transition-colors">
              Dashboard
            </Link>
          )}
          {user && (
            <Link to="/profile" className="hover:text-court-primary transition-colors">Profile</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-court-ink/60">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm font-medium px-4 py-2 rounded-full border border-court-line hover:border-court-primary hover:text-court-primary transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium px-4 py-2 hover:text-court-primary transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 rounded-full bg-court-primary text-white hover:bg-court-primary-dark transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
