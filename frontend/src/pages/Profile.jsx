import { useAuth } from '../context/AuthContext';

const roleLabel = { customer: 'Customer', arena_owner: 'Arena Owner', admin: 'Admin' };

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl">Profile</h1>

      <div className="mt-8 rounded-xl border border-court-line bg-white p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-court-ink/50 font-semibold">Name</p>
          <p className="font-medium mt-0.5">{user.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-court-ink/50 font-semibold">Email</p>
          <p className="font-medium mt-0.5">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-court-ink/50 font-semibold">Account type</p>
          <p className="font-medium mt-0.5">{roleLabel[user.role] || user.role}</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="mt-6 w-full py-3 rounded-full border border-court-line hover:border-court-danger hover:text-court-danger transition-colors font-medium text-sm"
      >
        Log out
      </button>
    </div>
  );
};

export default Profile;
