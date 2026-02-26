import { useState } from 'react';
import { Users, Shield, Plus, Search, MoreVertical, UserCheck, UserX, Crown } from 'lucide-react';

const demoUsers = [
  { id: 1, name: 'Juan Pérez', phone: '+56912345678', role: 'admin', status: 'active', alerts: 12, lastSeen: 'Ahora' },
  { id: 2, name: 'María González', phone: '+56987654321', role: 'coordinator', status: 'active', alerts: 8, lastSeen: '5 min' },
  { id: 3, name: 'Carlos López', phone: '+56911223344', role: 'guard', status: 'active', alerts: 15, lastSeen: '10 min' },
  { id: 4, name: 'Ana Martínez', phone: '+56955667788', role: 'user', status: 'active', alerts: 3, lastSeen: '1 h' },
  { id: 5, name: 'Pedro Sánchez', phone: '+56999887766', role: 'user', status: 'inactive', alerts: 0, lastSeen: '2 días' },
  { id: 6, name: 'Laura Torres', phone: '+56944332211', role: 'guard', status: 'active', alerts: 10, lastSeen: 'Ahora' },
  { id: 7, name: 'Jorge Rivera', phone: '+56966554433', role: 'coordinator', status: 'active', alerts: 6, lastSeen: '15 min' },
];

const roles = [
  { id: 'admin', name: 'Administrador', color: 'purple', icon: Crown },
  { id: 'coordinator', name: 'Coordinador', color: 'blue', icon: Shield },
  { id: 'guard', name: 'Guardia', color: 'green', icon: Shield },
  { id: 'user', name: 'Usuario', color: 'gray', icon: Users },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = demoUsers.filter(user => {
    const matchesFilter = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getRoleBadge = (role) => {
    const roleInfo = roles.find(r => r.id === role);
    const colors = {
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    const Icon = roleInfo?.icon || Users;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[roleInfo?.color || 'gray']}`}>
        <Icon size={12} />
        {roleInfo?.name || role}
      </span>
    );
  };

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Usuarios
          </h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
          >
            <Plus size={20} />
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {filteredUsers.length} usuarios ({demoUsers.filter(u => u.status === 'active').length} activos)
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            roleFilter === 'all' 
              ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-800' 
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Todos
        </button>
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setRoleFilter(role.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              roleFilter === role.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div 
            key={user.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  user.role === 'admin' ? 'bg-purple-500' :
                  user.role === 'coordinator' ? 'bg-blue-500' :
                  user.role === 'guard' ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{user.name}</h3>
                    {user.status === 'active' ? (
                      <UserCheck size={16} className="text-green-500" />
                    ) : (
                      <UserX size={16} className="text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              {getRoleBadge(user.role)}
              <div className="text-right">
                <p className="text-xs text-gray-400">Última vez: {user.lastSeen}</p>
                <p className="text-xs text-gray-400">{user.alerts} alertas enviadas</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
        </div>
      )}

      {/* Add User Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Agregar Usuario</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
