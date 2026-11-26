import { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, UserPlus, Search, 
  CheckCircle2, AlertCircle, RefreshCw, X, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { adminApi, type UserDto } from '../../services/adminApi';
import { useAuth } from '../../context/auth-context';

const AVAILABLE_ROLES: { value: UserDto['role']; label: string; badgeColor: string; description: string }[] = [
  { value: 'ADMIN', label: 'Administrator', badgeColor: 'bg-primary text-primary-foreground border-primary', description: 'Full system control, role assignment, and platform configuration' },
  { value: 'MANAGER', label: 'Operations Manager', badgeColor: 'bg-agro-forest/15 text-primary border-primary/30', description: 'Order approvals, procurement governance, inventory allocations' },
  { value: 'QC_INSPECTOR', label: 'QC Inspector', badgeColor: 'bg-agro-olive/20 text-tertiary border-tertiary/30', description: 'Fruit batch inspection, Brix testing, defect thresholds' },
  { value: 'LOGISTICS', label: 'Logistics Officer', badgeColor: 'bg-agro-wheat/30 text-amber-900 border-amber-500/30', description: 'Cold chain monitoring, packaging records, customs clearance' },
  { value: 'BUYER', label: 'International Buyer', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300', description: 'Produce browsing, RFQ submission, purchase order tracking' },
];

export default function AdminUsersPage() {
  const { hasRole } = useAuth();
  const isManagerOnly = hasRole('MANAGER') && !hasRole('ADMIN');

  const assignableRoles = isManagerOnly
    ? AVAILABLE_ROLES.filter(r => ['BUYER', 'QC_INSPECTOR', 'LOGISTICS'].includes(r.value))
    : AVAILABLE_ROLES;

  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdatingUserId, setIsUpdatingUserId] = useState<string | null>(null);

  // Create User Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER' as UserDto['role'],
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const fetchUsers = useCallback(async (silent = false) => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
      setErrorMessage(null);
      setLastSynced(new Date());
    } catch (err: any) {
      if (!silent) {
        if (!err.response) {
          setErrorMessage('Cannot connect to backend server. Please ensure Spring Boot is running on port 8080 (./mvnw spring-boot:run).');
        } else if (err.response.status === 401 || err.response.status === 403) {
          setErrorMessage('Session expired or unauthorized. Please log out and sign in again as Administrator.');
        } else {
          setErrorMessage(err.response?.data?.message || 'Failed to load system users.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      void fetchUsers(false);
    }, 0);
    return () => clearTimeout(initTimer);
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isCreateModalOpen && !isUpdatingUserId) {
        void fetchUsers(true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [isCreateModalOpen, isUpdatingUserId, fetchUsers]);

  const handleRefresh = () => {
    setIsLoading(true);
    setErrorMessage(null);
    void fetchUsers(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdatingUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await adminApi.assignRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      setSuccessMessage(`Role successfully updated to ${newRole} for ${updated.email}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to assign role.');
    } finally {
      setIsUpdatingUserId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    setIsUpdatingUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await adminApi.toggleUserStatus(userId, !currentActive);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      setSuccessMessage(`Account status changed to ${!currentActive ? 'Active' : 'Inactive'} for ${updated.email}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update account status.');
    } finally {
      setIsUpdatingUserId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    setIsSubmittingCreate(true);
    setErrorMessage(null);
    try {
      const newUser = await adminApi.createUser(createForm);
      setUsers(prev => [newUser, ...prev]);
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'BUYER' });
      setSuccessMessage(`User created and role '${newUser.role}' successfully assigned to ${newUser.email}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.error || 'Failed to create user.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || user.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-semibold text-primary mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
            <span>Strict Role Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">System Users & Role Assignment</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Every user role must be assigned by the Administrator. Self-assignment of staff permissions is strictly prohibited. (Synced {lastSynced.toLocaleTimeString()})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            size="sm" 
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User & Assign Role
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role Counts Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {AVAILABLE_ROLES.map(r => {
          const count = users.filter(u => u.role === r.value).length;
          return (
            <div 
              key={r.value}
              onClick={() => setSelectedRoleFilter(selectedRoleFilter === r.value ? 'ALL' : r.value)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedRoleFilter === r.value 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground truncate">{r.label}</span>
                <span className="text-lg font-heading font-extrabold text-foreground">{count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{r.description}</p>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by user name or email..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-background/50 border-border"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedRoleFilter === 'ALL'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({users.length})
          </button>
          {AVAILABLE_ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => setSelectedRoleFilter(r.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRoleFilter === r.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-border shadow-soft bg-card overflow-hidden">
        <CardHeader className="border-b border-border py-4 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-heading font-bold text-foreground">
              User Directory & Role Assignments
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {filteredUsers.length} of {users.length} registered accounts
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Admin Controlled RBAC
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading users directory...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No users found matching your search or role filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">User / Operator</th>
                    <th className="py-3 px-6">Email Address</th>
                    <th className="py-3 px-6">Currently Assigned Role</th>
                    <th className="py-3 px-6">Reassign Role (Admin)</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map(user => {
                    const isBusy = isUpdatingUserId === user.id;
                    const roleConfig = AVAILABLE_ROLES.find(r => r.value === user.role);

                    return (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center font-bold text-primary text-xs shrink-0">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 font-mono text-foreground">
                          {user.email}
                        </td>

                        {/* Current Role Badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleConfig?.badgeColor || 'bg-muted'}`}>
                            {roleConfig?.label || user.role}
                          </span>
                        </td>

                        {/* Interactive Role Assignment Dropdown */}
                        <td className="py-4 px-6">
                          {isManagerOnly && (user.role === 'ADMIN' || user.role === 'MANAGER') ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Protected HQ Account
                            </span>
                          ) : (
                            <select
                              disabled={isBusy}
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 font-medium text-foreground focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 cursor-pointer"
                            >
                              {assignableRoles.map(r => (
                                <option key={r.value} value={r.value}>
                                  Assign: {r.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Account Status Toggle */}
                        <td className="py-4 px-6">
                          <button
                            disabled={isBusy || (isManagerOnly && (user.role === 'ADMIN' || user.role === 'MANAGER'))}
                            onClick={() => handleToggleStatus(user.id, user.active)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                              user.active 
                                ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                                : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-primary' : 'bg-destructive'}`} />
                            {user.active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-6 text-right text-muted-foreground font-mono text-[11px]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User & Assign Role Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading font-bold text-foreground">Create User & Assign Role</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Full Name / Entity Name
                </label>
                <Input
                  required
                  placeholder="e.g. John Doe / Global Imports"
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. jdoe@field-ex.com"
                  value={createForm.email}
                  onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Initial Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={createForm.password}
                  onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Role Assigned {isManagerOnly ? 'by Operations Manager' : 'by Administrator'}
                </label>
                <select
                  value={createForm.role}
                  onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value as UserDto['role'] }))}
                  className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 font-medium text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  {assignableRoles.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.description}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Selected role will immediately grant permissions for the corresponding portal.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmittingCreate}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingCreate}
                  className="font-semibold"
                >
                  {isSubmittingCreate ? 'Creating & Assigning...' : 'Confirm & Assign Role'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
