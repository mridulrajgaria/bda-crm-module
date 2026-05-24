import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { Plus, Edit2, MoreHorizontal } from 'lucide-react';
import api, { STATUS_LABELS, PRIORITY_COLORS, formatNumber } from '../../utils/api';
import { LoadingSpinner, Avatar } from '../../components/common/index.jsx';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'new', label: 'New', color: 'bg-blue-500', light: 'bg-blue-50 border-blue-200' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500', light: 'bg-yellow-50 border-yellow-200' },
  { id: 'qualified', label: 'Qualified', color: 'bg-purple-500', light: 'bg-purple-50 border-purple-200' },
  { id: 'proposal-sent', label: 'Proposal Sent', color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-pink-500', light: 'bg-pink-50 border-pink-200' },
  { id: 'won', label: 'Won ✓', color: 'bg-green-500', light: 'bg-green-50 border-green-200' },
  { id: 'lost', label: 'Lost', color: 'bg-red-400', light: 'bg-red-50 border-red-200' },
];

export default function LeadKanban() {
  const [columns, setColumns] = useState(() => Object.fromEntries(COLUMNS.map((c) => [c.id, []])));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads', { params: { limit: 200 } })
      .then(({ data }) => {
        const grouped = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
        data.leads.forEach((lead) => {
          if (grouped[lead.status]) grouped[lead.status].push(lead);
        });
        setColumns(grouped);
      })
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const srcCol = [...columns[source.droppableId]];
    const dstCol = source.droppableId === destination.droppableId ? srcCol : [...columns[destination.droppableId]];
    const [moved] = srcCol.splice(source.index, 1);
    dstCol.splice(destination.index, 0, { ...moved, status: destination.droppableId });

    setColumns((prev) => ({
      ...prev,
      [source.droppableId]: srcCol,
      [destination.droppableId]: dstCol,
    }));

    try {
      await api.put(`/leads/${draggableId}/status`, { status: destination.droppableId });
      toast.success(`Moved to ${STATUS_LABELS[destination.droppableId]}`);
    } catch {
      toast.error('Failed to update status');
      // Revert
      const revert = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
      Object.entries(columns).forEach(([k, v]) => { revert[k] = [...v]; });
      setColumns(revert);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kanban Board</h2>
          <p className="text-sm text-gray-500">Drag & drop leads to move them through the pipeline</p>
        </div>
        <Link to="/leads/new" className="btn-primary">
          <Plus size={15} /> Add Lead
        </Link>
      </div>

      <div className="overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => {
              const cards = columns[col.id] || [];
              const totalValue = cards.reduce((s, c) => s + (c.value || 0), 0);

              return (
                <div key={col.id} className="w-64 flex flex-col">
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border ${col.light}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <span className="text-xs font-bold text-gray-700">{col.label}</span>
                      <span className="text-xs bg-white text-gray-500 border border-gray-200 rounded-full px-1.5 py-0.5 font-semibold">
                        {cards.length}
                      </span>
                    </div>
                    {totalValue > 0 && (
                      <span className="text-[10px] text-gray-500 font-medium">{formatNumber(totalValue)}</span>
                    )}
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[400px] p-2 rounded-b-xl border border-t-0 space-y-2 transition-colors ${
                          snapshot.isDraggingOver ? `${col.light} border-opacity-100` : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {cards.map((lead, index) => (
                          <Draggable key={lead._id} draggableId={lead._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg border-indigo-300 rotate-1' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1 mb-2">
                                  <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{lead.title}</p>
                                  <Link
                                    to={`/leads/${lead._id}/edit`}
                                    className="p-0.5 rounded hover:bg-gray-100 text-gray-400 flex-shrink-0"
                                  >
                                    <Edit2 size={11} />
                                  </Link>
                                </div>
                                <p className="text-[11px] text-gray-400 mb-2">{lead.company}</p>
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${PRIORITY_COLORS[lead.priority]}`}>
                                    {lead.priority}
                                  </span>
                                  <span className="text-xs font-bold text-indigo-600">{formatNumber(lead.value)}</span>
                                </div>
                                {lead.assignedTo && (
                                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                                    <Avatar name={lead.assignedTo.name} avatar={lead.assignedTo.avatar} size="sm" />
                                    <span className="text-[10px] text-gray-400">{lead.assignedTo.name?.split(' ')[0]}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {cards.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-20 text-xs text-gray-300">
                            Drop leads here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
