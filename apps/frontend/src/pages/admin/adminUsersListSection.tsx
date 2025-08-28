import { useEffect, useState } from 'react';
import AccordionSection from '../../components/accordionSection';
import { UserDTO, usersService } from '../../services/users.service';

export default function AdminUsersListSection() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await usersService.list();
      setUsers(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const right = (
    <button
      className="text-sm underline"
      onClick={(e) => {
        e.stopPropagation();
        load();
      }}
      disabled={loading}
      title="Rafraîchir"
    >
      {loading ? '...' : 'Rafraîchir'}
    </button>
  );

  return (
    <AccordionSection title="Utilisateurs" rightAdornment={right}>
      {err && (
        <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{err}</div>
      )}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Nom</th>
              <th className="text-left p-2">Rôle</th>
              <th className="text-left p-2">Créé</th>
              <th className="text-left p-2">MAJ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.name ?? '—'}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  {new Date(u.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="p-2">
                  {new Date(u.updatedAt).toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Aucun utilisateur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AccordionSection>
  );
}
