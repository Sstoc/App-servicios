import React, { useState, useMemo } from 'react';
import { Card, Badge } from '../ui';
import { formatMoney, getIcon, getCategoryLabel } from '../../lib/utils';
import { exportToCSV, exportToPDF } from '../../lib/exportUtils';

export const HistoryView = ({ bills, handleEdit, showBalance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openHistoryGroups, setOpenHistoryGroups] = useState({});
  const [expandedBill, setExpandedBill] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(null); // key del grupo en proceso

  const toggleHistoryGroup = (key) => {
    setOpenHistoryGroups(prev => ({ ...prev, [key]: !prev[key] }));
    setExpandedBill(null); // Cierra detalle al colapsar grupo
  };

  const toggleBillDetail = (billId) => {
    setExpandedBill(prev => (prev === billId ? null : billId));
  };

  const handleExportCSV = (e, group) => {
    e.stopPropagation();
    exportToCSV(group.bills, group.title);
  };

  const handleExportPDF = async (e, group) => {
    e.stopPropagation();
    setExportingPDF(group.key);
    try {
      await exportToPDF(group.bills, group.title);
    } finally {
      setExportingPDF(null);
    }
  };

  const normalize = (str) =>
    (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const isSearching = searchQuery.trim().length > 0;
  const q = normalize(searchQuery.trim());

  const filteredBills = useMemo(() => {
    if (!isSearching) return bills;
    return bills.filter(bill => {
      const nameMatch = normalize(bill.name).includes(q);
      const catMatch = normalize(getCategoryLabel(bill.category)).includes(q);
      return nameMatch || catMatch;
    });
  }, [bills, isSearching, q]);

  const historyGroups = useMemo(() => {
    const groups = {};
    filteredBills.forEach(bill => {
      if (!bill.dueDate) return;
      const d = new Date(bill.dueDate + 'T12:00:00');
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      if (!groups[key]) {
        groups[key] = { key, title: key, bills: [], total: 0, isFullyPaid: true, date: d };
      }
      groups[key].bills.push(bill);
      groups[key].total += Number(bill.amount);
      if (!bill.paid) groups[key].isFullyPaid = false;
    });
    // Ordenamos cronológicamente descendente (más reciente primero)
    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [filteredBills]);

  return (
    <div className="space-y-4 pb-20">
      {/* Barra de búsqueda interactiva */}
      <div className="relative">
        <div className="relative flex items-center">
          <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-sm pointer-events-none"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o categoría (ej: Luz, Internet, Auto)..."
            className="w-full pl-11 pr-10 py-3.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all backdrop-blur-md shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 text-xs transition"
              title="Limpiar búsqueda"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
        {isSearching && (
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 px-1">
            <span>
              Resultados para <span className="text-blue-600 dark:text-blue-400 font-bold">"{searchQuery}"</span>
            </span>
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {filteredBills.length} {filteredBills.length === 1 ? 'servicio' : 'servicios'}
            </span>
          </div>
        )}
      </div>

      {historyGroups.map(group => {
        const isGroupOpen = isSearching || !!openHistoryGroups[group.key];

        return (
          <Card key={group.key} className="p-0 overflow-hidden !translate-y-0 border-none shadow-md !rounded-3xl">
            {/* Cabecera del grupo (mes) */}
            <div
              onClick={() => toggleHistoryGroup(group.key)}
              className={`w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${isGroupOpen ? 'rounded-t-3xl' : 'rounded-3xl'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${group.isFullyPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <i className={`fa-solid ${group.isFullyPaid ? 'fa-check' : 'fa-hourglass-start'}`}></i>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 capitalize text-lg tracking-tight">{group.title}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{group.bills.length} movimientos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-lg whitespace-nowrap">
                  {showBalance ? formatMoney(group.total) : '****'}
                </span>
                {/* Botones de exportación */}
                <button
                  onClick={(e) => handleExportCSV(e, group)}
                  title="Exportar a Excel (CSV)"
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-500/20 dark:hover:text-green-400 transition-all"
                >
                  <i className="fa-solid fa-file-excel text-xs"></i>
                </button>
                <button
                  onClick={(e) => handleExportPDF(e, group)}
                  title="Exportar a PDF"
                  disabled={exportingPDF === group.key}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-all disabled:opacity-50"
                >
                  {exportingPDF === group.key
                    ? <i className="fa-solid fa-spinner animate-spin text-xs"></i>
                    : <i className="fa-solid fa-file-pdf text-xs"></i>
                  }
                </button>
                <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center transition-transform duration-300 ${isGroupOpen ? 'rotate-180 bg-blue-50 dark:bg-blue-500/20 text-blue-600' : 'text-slate-400'}`}>
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            {/* Lista de servicios del grupo */}
            <div className={`grid transition-all duration-300 ease-in-out ${isGroupOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 space-y-2 rounded-b-3xl">
                  {group.bills.map(bill => {
                    const isExpanded = expandedBill === bill.id;
                    const dueDateFormatted = new Date(bill.dueDate + 'T12:00:00').toLocaleDateString('es-AR', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                    });
                    const installmentPct = bill.isInstallments && bill.totalInstallments > 0
                      ? Math.round((bill.currentInstallment / bill.totalInstallments) * 100)
                      : 0;

                    return (
                      <div
                        key={bill.id}
                        className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-200 dark:border-blue-500/30 shadow-lg shadow-blue-100/50 dark:shadow-blue-500/5' : 'border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md'}`}
                      >
                        {/* Fila principal — clickeable */}
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer gap-3 select-none"
                          onClick={() => toggleBillDetail(bill.id)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center shadow-inner transition-colors duration-300 ${isExpanded ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>
                              {getIcon(bill.category)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-700 dark:text-slate-200 text-xs tracking-tight truncate block">
                                {bill.name}
                              </span>
                              {bill.isInstallments && (
                                <span className="text-[9px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest">
                                  Cuota {bill.currentInstallment}/{bill.totalInstallments}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={bill.paid ? 'green' : 'red'}>{bill.paid ? 'PAGO' : 'IMPAGO'}</Badge>
                            <span className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap text-sm">
                              {showBalance ? formatMoney(bill.amount) : '****'}
                            </span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-300 dark:text-slate-600'}`}>
                              <i className="fa-solid fa-chevron-down text-[10px]"></i>
                            </div>
                          </div>
                        </div>

                        {/* Desplegable de detalle */}
                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
                              {/* Grid de 3 mini-tarjetas de datos */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-3">
                                {/* Vencimiento */}
                                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px]">
                                    <i className="fa-solid fa-calendar-day"></i>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Vencimiento</p>
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 capitalize truncate">{dueDateFormatted}</p>
                                    {bill.paid && bill.paidAt && (
                                      <p className="text-[9px] text-green-600 dark:text-green-400 font-semibold mt-0.5">
                                        Pagado el {new Date(bill.paidAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Categoría */}
                                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                                    {getIcon(bill.category)}
                                  </div>
                                  <div>
                                    <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Categoría</p>
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{getCategoryLabel(bill.category)}</p>
                                  </div>
                                </div>

                                {/* Tipo de monto */}
                                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 flex items-start gap-2.5">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${bill.isFixed ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    <i className={`fa-solid ${bill.isFixed ? 'fa-lock text-amber-500' : 'fa-arrows-up-down text-slate-400'} text-[11px]`}></i>
                                  </div>
                                  <div>
                                    <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Tipo</p>
                                    <p className={`text-[11px] font-bold ${bill.isFixed ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                      {bill.isFixed ? 'Monto fijo' : 'Variable'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Barra de progreso de cuotas */}
                              {bill.isInstallments && bill.totalInstallments > 0 && (
                                <div className="bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 rounded-xl p-3 mb-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <p className="text-[8px] uppercase font-black text-purple-500 dark:text-purple-400 tracking-widest">Progreso de cuotas</p>
                                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-400">{installmentPct}%</span>
                                  </div>
                                  <div className="w-full bg-purple-100 dark:bg-purple-500/10 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
                                      style={{ width: `${installmentPct}%` }}
                                    />
                                  </div>
                                  <p className="text-[9px] text-purple-500/70 dark:text-purple-400/60 font-bold mt-1.5">
                                    Cuota {bill.currentInstallment} de {bill.totalInstallments}
                                  </p>
                                </div>
                              )}

                              {/* Botón editar */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(bill); }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-100 dark:border-blue-500/20 active:scale-[0.98]"
                              >
                                <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                                Editar servicio
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {historyGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
            <i className={`fa-solid ${isSearching ? 'fa-magnifying-glass' : 'fa-receipt'}`}></i>
          </div>
          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
            {isSearching ? 'No se encontraron resultados' : 'No hay historial disponible'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4 font-medium leading-relaxed">
            {isSearching
              ? `No encontramos ningún servicio que coincida con "${searchQuery}". Probá con otro término.`
              : 'Los servicios de meses anteriores aparecerán aquí organizados cronológicamente.'}
          </p>
          {isSearching && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
};
