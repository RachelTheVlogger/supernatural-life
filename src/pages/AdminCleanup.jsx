import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

export default function AdminCleanup() {
  const queryClient = useQueryClient();

  const { data: nymphs = [] } = useQuery({
    queryKey: ['waterNymphs'],
    queryFn: () => base44.entities.WaterNymph.list()
  });

  const handleDelete = async (id) => {
    await base44.entities.WaterNymph.delete(id);
    queryClient.invalidateQueries(['waterNymphs']);
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <h1 className="text-white text-2xl mb-4">Water Nymphs</h1>
      <div className="space-y-2">
        {nymphs.map(n => (
          <div key={n.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
            <div>
              <p className="text-white">{n.name}</p>
              <p className="text-gray-400 text-sm">{n.id}</p>
            </div>
            <button
              onClick={() => handleDelete(n.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}