import React from 'react';
import { X, ArrowRight, Archive, Trash2, CheckSquare } from 'lucide-react';

interface BatchActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onMoveToStatus: (status: string) => void;
  onArchive: () => void;
  onDelete: () => void;
  showMoveOptions?: boolean;
  statuses?: string[];
}

const statusColors: Record<string, string> = {
  open: 'bg-gray-600',
  'in-progress': 'bg-blue-600',
  'under-review': 'bg-purple-600',
  resolved: 'bg-green-600',
  closed: 'bg-gray-800',
};

export const BatchActionsToolbar: React.FC<BatchActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onMoveToStatus,
  onArchive,
  onDelete,
  showMoveOptions = true,
  statuses = ['open', 'in-progress', 'under-review', 'resolved', 'closed'],
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-gray-700">
          <CheckSquare className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">{selectedCount} selected</span>
        </div>

        {showMoveOptions && (
          <div className="flex items-center gap-2 pr-4 border-r border-gray-700">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => onMoveToStatus(status)}
                className={`px-3 py-1 rounded text-xs font-medium text-white hover:opacity-80 transition-opacity ${statusColors[status] || 'bg-gray-600'}`}
                title={`Move to ${status}`}
              >
                {status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onArchive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
          title="Archive selected"
        >
          <Archive className="w-4 h-4" />
          Archive
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm transition-colors"
          title="Delete selected"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>

        <button
          onClick={onClearSelection}
          className="ml-2 p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
