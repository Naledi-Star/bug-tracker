import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GripVertical, Search, X, Filter, Keyboard, LayoutGrid, LayoutList } from 'lucide-react';
import { BatchActionsToolbar } from './BatchActionsToolbar';

export interface KanbanBug {
  id: string;
  title: string;
  description?: string;
  status: string;
  severity: string;
  priority: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface KanbanBoardProps {
  bugs: KanbanBug[];
  teamMembers: TeamMember[];
  onStatusChange: (bugId: string, newStatus: string) => void;
  onBatchMove?: (bugIds: string[], newStatus: string) => void;
  onBatchDelete?: (bugIds: string[]) => void;
}

const COLUMNS = [
  { id: 'open', title: 'Open', color: '#6b7280', bgColor: 'rgba(107,114,128,0.1)' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.1)' },
  { id: 'under-review', title: 'Under Review', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.1)' },
  { id: 'resolved', title: 'Resolved', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
  { id: 'closed', title: 'Closed', color: '#6b7280', bgColor: 'rgba(107,114,128,0.05)' },
];

const STATUS_OPTIONS = COLUMNS.map(c => c.id);

function getAgingDays(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

function getAgingColor(days: number): string {
  if (days <= 3) return '#10b981';
  if (days <= 7) return '#f59e0b';
  if (days <= 14) return '#f97316';
  return '#ef4444';
}

function getSeverityBadge(severity: string) {
  const colors: Record<string, string> = {
    blocker: 'bg-red-500 text-white',
    critical: 'bg-red-400 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-gray-500 text-white',
  };
  return colors[severity] || 'bg-gray-500 text-white';
}

function getSeverityLabel(severity: string): string {
  return severity.charAt(0).toUpperCase();
}

function getPriorityBadge(priority: string) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    low: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  };
  return colors[priority] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
}

function getAgeLabel(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

// WIP limits stored in localStorage
const WIP_LIMITS_KEY = 'bugtracker_wip_limits';

function getWIPLimits(): Record<string, number> {
  try {
    const saved = localStorage.getItem(WIP_LIMITS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { open: 15, 'in-progress': 5, 'under-review': 5, resolved: 20, closed: 999 };
}

function saveWIPLimits(limits: Record<string, number>) {
  try {
    localStorage.setItem(WIP_LIMITS_KEY, JSON.stringify(limits));
  } catch {}
}

function BugCard({
  bug,
  onDragStart,
  isSelected,
  isFocused,
  onSelect,
  onNavigate,
  viewMode,
}: {
  bug: KanbanBug;
  onDragStart: (e: React.DragEvent, bug: KanbanBug) => void;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (bug: KanbanBug, multi: boolean) => void;
  onNavigate: (id: string) => void;
  viewMode: 'expanded' | 'compact';
}) {
  const agingDays = getAgingDays(bug.updated_at);
  const agingColor = getAgingColor(agingDays);
  const ageLabel = getAgeLabel(agingDays);

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      onSelect(bug, true);
    } else {
      onNavigate(bug.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(bug, e.shiftKey);
    }
  };

  if (viewMode === 'compact') {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, bug)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={`bg-gray-700/50 rounded-lg px-3 py-2 cursor-pointer border-l-[3px] transition-all hover:bg-gray-700 group ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isFocused ? 'ring-2 ring-blue-400' : ''}`}
        style={{ borderLeftColor: agingColor }}
      >
        <div className="flex items-center gap-2">
          <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${getSeverityBadge(bug.severity)}`}>
            {getSeverityLabel(bug.severity)}
          </span>
          <span className="text-sm text-white truncate flex-1">{bug.title}</span>
          {bug.assignee_id && (
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center shrink-0">
              ?
            </div>
          )}
          {agingDays >= 7 && (
            <span className="text-[10px] text-gray-400 shrink-0">{ageLabel}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, bug)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`bg-gray-700/50 rounded-xl p-3 cursor-pointer border-l-[4px] transition-all hover:bg-gray-700 group ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isFocused ? 'ring-2 ring-blue-400' : ''}`}
      style={{ borderLeftColor: agingColor }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 cursor-grab" />
        <h4 className="text-sm font-medium text-white flex-1 line-clamp-2">{bug.title}</h4>
      </div>

      {bug.description && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{bug.description}</p>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getSeverityBadge(bug.severity)}`}>
          {bug.severity}
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getPriorityBadge(bug.priority)}`}>
          {bug.priority}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {bug.assignee_id ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">
              ?
            </div>
            <span className="text-xs text-gray-400">Assigned</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500 italic">Unassigned</span>
        )}
        {agingDays >= 3 && (
          <span className={`text-[10px] font-medium flex items-center gap-1 ${agingDays >= 14 ? 'text-red-400' : 'text-gray-400'}`}>
            {agingDays >= 14 ? '!' : ''} {ageLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function WipModal({
  columnId,
  currentLimit,
  onSave,
  onClose,
}: {
  columnId: string;
  currentLimit: number;
  onSave: (limit: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(currentLimit === 999 ? 999 : currentLimit);
  const isUnlimited = value >= 999;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">Set WIP Limit</h3>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Maximum items in column</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={30}
              value={isUnlimited ? 30 : value}
              onChange={(e) => setValue(parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={isUnlimited ? '∞' : value}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v > 0) setValue(v);
              }}
              className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-white"
              disabled={isUnlimited}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isUnlimited}
            onChange={(e) => setValue(e.target.checked ? 999 : 10)}
            className="rounded"
          />
          <span className="text-sm text-gray-300">Unlimited</span>
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">Cancel</button>
          <button onClick={() => onSave(value)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">Save</button>
        </div>
      </div>
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: 'Click', desc: 'Open bug detail page' },
    { key: 'Shift+Click', desc: 'Select bug for batch actions' },
    { key: 'Tab', desc: 'Navigate focus through bug cards' },
    { key: 'Enter / Space', desc: 'Select/deselect focused bug' },
    { key: '\u2190 \u2192', desc: 'Move selected bug between columns' },
    { key: 'Esc', desc: 'Deselect current bug' },
    { key: '?', desc: 'Toggle this help' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Keyboard className="w-5 h-5" /> Keyboard Shortcuts
        </h3>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 font-mono min-w-[80px] text-center">{s.key}</kbd>
              <span className="text-sm text-gray-400">{s.desc}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">Close</button>
      </div>
    </div>
  );
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  bugs,
  teamMembers,
  onStatusChange,
  onBatchMove,
  onBatchDelete,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedBugs, setSelectedBugs] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');
  const [showHelp, setShowHelp] = useState(false);
  const [wipLimits, setWipLimits] = useState<Record<string, number>>(getWIPLimits);
  const [editingWipColumn, setEditingWipColumn] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const memberMap = useMemo(() => {
    const map: Record<string, TeamMember> = {};
    teamMembers.forEach((m) => { map[m.id] = m; });
    return map;
  }, [teamMembers]);

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      if (searchTerm && !bug.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedAssignee !== 'all') {
        if (selectedAssignee === 'unassigned' && bug.assignee_id) return false;
        if (selectedAssignee !== 'unassigned' && bug.assignee_id !== selectedAssignee) return false;
      }
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(bug.severity)) return false;
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(bug.priority)) return false;
      return true;
    });
  }, [bugs, searchTerm, selectedAssignee, selectedSeverities, selectedPriorities]);

  const columnBugs = useMemo(() => {
    const map: Record<string, KanbanBug[]> = {};
    COLUMNS.forEach((col) => { map[col.id] = []; });
    filteredBugs.forEach((bug) => {
      if (map[bug.status]) map[bug.status].push(bug);
    });
    return map;
  }, [filteredBugs]);

  const handleDragStart = useCallback((e: React.DragEvent, bug: KanbanBug) => {
    e.dataTransfer.setData('text/plain', bug.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const bugId = e.dataTransfer.getData('text/plain');
    const limit = wipLimits[columnId] || 999;
    const currentCount = columnBugs[columnId]?.length || 0;

    if (limit < 999 && currentCount >= limit) {
      if (!window.confirm(`WIP limit reached for "${COLUMNS.find(c => c.id === columnId)?.title}" (${currentCount}/${limit}). Move anyway?`)) {
        return;
      }
    }

    onStatusChange(bugId, columnId);
  }, [onStatusChange, wipLimits, columnBugs]);

  const handleSelectBug = useCallback((bug: KanbanBug, multi: boolean) => {
    setSelectedBugs((prev) => {
      const next = new Set(multi ? prev : []);
      if (next.has(bug.id)) {
        next.delete(bug.id);
      } else {
        next.add(bug.id);
      }
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '?') {
      e.preventDefault();
      setShowHelp((prev) => !prev);
      return;
    }

    if (selectedBugs.size === 0) return;

    const flatBugs = COLUMNS.flatMap((col) => columnBugs[col.id] || []);
    const selectedId = [...selectedBugs][selectedBugs.size - 1];
    const currentIndex = flatBugs.findIndex((b) => b.id === selectedId);
    if (currentIndex === -1) return;

    if (e.key === 'Escape') {
      setSelectedBugs(new Set());
      setFocusedIndex(-1);
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentBug = flatBugs[currentIndex];
      const currentColIndex = COLUMNS.findIndex((c) => c.id === currentBug.status);
      const newColIndex = e.key === 'ArrowRight'
        ? Math.min(currentColIndex + 1, COLUMNS.length - 1)
        : Math.max(currentColIndex - 1, 0);

      if (currentColIndex !== newColIndex) {
        const newStatus = COLUMNS[newColIndex].id;
        const limit = wipLimits[newStatus] || 999;
        const currentCount = columnBugs[newStatus]?.length || 0;
        if (limit < 999 && currentCount >= limit) {
          return;
        }
        onStatusChange(selectedId, newStatus);
      }
      return;
    }
  }, [selectedBugs, columnBugs, wipLimits, onStatusChange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAssignee('all');
    setSelectedSeverities([]);
    setSelectedPriorities([]);
  };

  const activeFilterCount =
    (selectedAssignee !== 'all' ? 1 : 0) +
    selectedSeverities.length +
    selectedPriorities.length +
    (searchTerm ? 1 : 0);

  const handleWipSave = (limit: number) => {
    if (editingWipColumn) {
      const newLimits = { ...wipLimits, [editingWipColumn]: limit };
      setWipLimits(newLimits);
      saveWIPLimits(newLimits);
      setEditingWipColumn(null);
    }
  };

  // Batch operations
  const handleBatchMove = (newStatus: string) => {
    if (onBatchMove && selectedBugs.size > 0) {
      onBatchMove([...selectedBugs], newStatus);
      setSelectedBugs(new Set());
    }
  };

  const handleBatchDelete = () => {
    if (onBatchDelete && selectedBugs.size > 0) {
      if (window.confirm(`Delete ${selectedBugs.size} bug(s)? This cannot be undone.`)) {
        onBatchDelete([...selectedBugs]);
        setSelectedBugs(new Set());
      }
    }
  };

  return (
    <div
      ref={boardRef}
      className="flex flex-col h-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters {activeFilterCount > 0 && <span className="bg-blue-500 text-white text-[10px] px-1.5 rounded-full">{activeFilterCount}</span>}
        </button>

        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-gray-400 hover:text-white"
        >
          <Keyboard className="w-4 h-4" /> ?
        </button>

        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('expanded')}
            className={`p-2 ${viewMode === 'expanded' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Expanded view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`p-2 ${viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Compact view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white">
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Assignee</label>
            <div className="space-y-1">
              {['all', 'unassigned', ...teamMembers.map((m) => m.id)].map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedAssignee(id)}
                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                    selectedAssignee === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {id === 'all' ? 'All' : id === 'unassigned' ? 'Unassigned' : memberMap[id]?.name || id}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Severity</label>
            <div className="flex flex-wrap gap-1">
              {['low', 'medium', 'high', 'blocker'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeverities((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedSeverities.includes(s) ? getSeverityBadge(s) : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Priority</label>
            <div className="flex flex-wrap gap-1">
              {['low', 'medium', 'high', 'critical'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriorities((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedPriorities.includes(p) ? getPriorityBadge(p) : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-300">
              Search: {searchTerm}
              <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedAssignee !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-300">
              {selectedAssignee === 'unassigned' ? 'Unassigned' : memberMap[selectedAssignee]?.name || selectedAssignee}
              <button onClick={() => setSelectedAssignee('all')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedSeverities.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-300">
              {s}
              <button onClick={() => setSelectedSeverities((prev) => prev.filter((x) => x !== s))}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {selectedPriorities.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-300">
              {p}
              <button onClick={() => setSelectedPriorities((prev) => prev.filter((x) => x !== p))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Aging Legend */}
      <div className="flex items-center gap-4 mb-3 text-[11px]">
        {[
          { label: '0-3d', color: '#10b981' },
          { label: '3-7d', color: '#f59e0b' },
          { label: '7-14d', color: '#f97316' },
          { label: '14d+', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-400">{item.label}</span>
          </div>
        ))}
        {activeFilterCount > 0 && (
          <span className="text-gray-500 ml-2">
            Showing {filteredBugs.length} of {bugs.length} bugs
          </span>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
        {COLUMNS.map((column) => {
          const columnBugList = columnBugs[column.id] || [];
          const wipLimit = wipLimits[column.id] || 999;
          const isOverWip = wipLimit < 999 && columnBugList.length > wipLimit;
          const staleCount = columnBugList.filter((b) => getAgingDays(b.updated_at) >= 7).length;

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-72"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`rounded-xl p-3 min-h-[200px] ${isOverWip ? 'bg-red-900/10 border border-red-500/30' : 'bg-gray-800/30'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                    <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                    <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
                      {columnBugList.length}{wipLimit < 999 ? `/${wipLimit}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {staleCount > 0 && (
                      <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded" title={`${staleCount} bugs 7+ days old`}>
                        {staleCount} stale
                      </span>
                    )}
                    <button
                      onClick={() => setEditingWipColumn(column.id)}
                      className="text-[10px] text-gray-500 hover:text-gray-300 bg-gray-700/50 px-1.5 py-0.5 rounded"
                      title="Edit WIP limit"
                    >
                      WIP:{wipLimit < 999 ? wipLimit : '∞'}
                    </button>
                  </div>
                </div>

                {isOverWip && (
                  <div className="mb-2 text-[11px] text-red-400 bg-red-500/10 rounded px-2 py-1">
                    WIP limit exceeded ({columnBugList.length}/{wipLimit})
                  </div>
                )}

                <div className="space-y-2">
                  {columnBugList.map((bug) => (
                    <BugCard
                      key={bug.id}
                      bug={bug}
                      onDragStart={handleDragStart}
                      isSelected={selectedBugs.has(bug.id)}
                      isFocused={false}
                      onSelect={handleSelectBug}
                      onNavigate={(id) => navigate(`/dashboard/defects/${id}`)}
                      viewMode={viewMode}
                    />
                  ))}
                  {columnBugList.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-sm">
                      Drop bugs here
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Actions Toolbar */}
      {selectedBugs.size > 0 && (
        <BatchActionsToolbar
          selectedCount={selectedBugs.size}
          onClearSelection={() => setSelectedBugs(new Set())}
          onMoveToStatus={handleBatchMove}
          onArchive={() => handleBatchMove('closed')}
          onDelete={handleBatchDelete}
          statuses={STATUS_OPTIONS}
        />
      )}

      {/* Modals */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {editingWipColumn && (
        <WipModal
          columnId={editingWipColumn}
          currentLimit={wipLimits[editingWipColumn]}
          onSave={handleWipSave}
          onClose={() => setEditingWipColumn(null)}
        />
      )}
    </div>
  );
};
