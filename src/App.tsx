import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Package,
  AlertCircle,
  Trash2,
  CheckCircle2,
  FileDown,
  Save,
  AlertTriangle,
  Layers,
  ShoppingBag,
} from "lucide-react";
import "./styles.css";

const COLORS_MASTER = [
  "Celeste Oscuro",
  "Lavanda",
  "Nuevo Morado",
  "Verde Zule",
  "Lacre",
  "Celeste Bebé",
  "Blanco",
  "Rojo",
  "Rosado Bebé",
  "Turquesa Bebé",
  "Fucsia 2",
  "Verde agua",
  "Flor de papa",
  "Melon",
  "Pavo",
  "Verde esmeralda",
  "Vino",
  "Rosado",
  "Verde Cemento",
  "Palo Rosa",
  "Barnie",
  "Amarillo Bebé",
  "Verde Jade",
  "Crema",
  "Celeste",
  "Fucsia 1",
  "Yogurt",
  "Verde Cobalto",
  "Coral",
  "Verde Manzana",
  "Verde Palta",
  "Turquesa",
  "Melon Bebé",
  "Aceituna",
  "Verde Agua Bebé",
  "Cosmetico",
  "Lila",
  "Chicle",
  "Palo Rosa Bebé",
];

export default function App() {
  const [rollos, setRollos] = useState<any[]>(() => {
    const saved = localStorage.getItem("seda_otis_v3");
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    id: number | "all" | null;
  }>({ show: false, id: null });

  const [nuevo, setNuevo] = useState({
    color: COLORS_MASTER[0],
    codigo: "",
    ancho: 1.6,
    metros: 100,
  });

  useEffect(() => {
    localStorage.setItem("seda_otis_v3", JSON.stringify(rollos));
  }, [rollos]);

  const coloresConStock = useMemo(
    () => Array.from(new Set(rollos.map((r) => r.color))),
    [rollos]
  );

  const coloresSinStock = useMemo(
    () => COLORS_MASTER.filter((c) => !coloresConStock.includes(c)),
    [coloresConStock]
  );

  const agregarRollo = () => {
    if (!nuevo.codigo.trim()) return;
    setRollos([{ ...nuevo, id: Date.now() }, ...rollos]);
    setNuevo({
      ...nuevo,
      codigo: "",
      metros: 100,
      ancho: 1.6,
      color: nuevo.color,
    });
  };

  const ejecutarBorrado = () => {
    if (confirmModal.id === "all") {
      setRollos([]);
      localStorage.removeItem("seda_otis_v3");
    } else if (typeof confirmModal.id === "number") {
      setRollos(rollos.filter((r) => r.id !== confirmModal.id));
    }
    setConfirmModal({ show: false, id: null });
  };

  // --- FUNCIÓN DE PDF PREMIUM (IGUAL A LA EXPLICADA) ---
  const generarPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString();

    // 1. ENCABEZADO ESTILO CORPORATIVO
    doc.setFillColor(157, 33, 54); // Guinda Sedny'ssa
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SEDNY'SSA", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PREMIUM STOCK SYSTEM - BY OTIS", 14, 27);
    doc.text(`FECHA DE EMISIÓN: ${fecha}`, 140, 27);

    // 2. SECCIÓN 1: DETALLE DE LOTES
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. DETALLE DE LOTES (FÍSICO)", 14, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`TOTAL ROLLOS EN ALMACÉN: ${rollos.length}`, 14, 56);

    const tablaLotes = rollos.map((r) => [
      r.codigo,
      `Seda Otis ${r.color}`,
      `${r.ancho}m`,
      `${r.metros}m`,
    ]);

    (doc as any).autoTable({
      startY: 60,
      head: [["LOTE ID", "ESPECIFICACIÓN", "ANCHO", "METRAJE"]],
      body: tablaLotes,
      theme: "grid",
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 9 },
    });

    // 3. SECCIÓN 2: RESUMEN POR COLOR
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. RESUMEN DE STOCK POR COLOR", 14, finalY);

    const resumenData = coloresConStock.map((color) => {
      const cantidad = rollos.filter((r) => r.color === color).length;
      return [`Seda Otis ${color}`, `${cantidad} rollos`];
    });

    (doc as any).autoTable({
      startY: finalY + 5,
      head: [["COLOR", "CANTIDAD EN ALMACÉN"]],
      body: resumenData,
      theme: "striped",
      headStyles: { fillColor: [70, 70, 70] },
      styles: { fontSize: 9 },
    });

    // 4. SECCIÓN 3: COLORES AGOTADOS
    finalY = (doc as any).lastAutoTable.finalY + 15;
    if (finalY > 240) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(157, 33, 54);
    doc.text(
      `3. COLORES SIN STOCK (${coloresSinStock.length} FALTANTES)`,
      14,
      finalY
    );

    const tablaAgotados = coloresSinStock.map((c) => [c, "AGOTADO"]);

    (doc as any).autoTable({
      startY: finalY + 5,
      head: [["NOMBRE DEL COLOR", "ESTADO"]],
      body: tablaAgotados,
      theme: "grid",
      headStyles: { fillColor: [157, 33, 54] },
      columnStyles: { 1: { textColor: [157, 33, 54], fontStyle: "bold" } },
      styles: { fontSize: 9 },
    });

    doc.save(`Reporte_Sednyssa_${fecha.replace(/\//g, "-")}.pdf`);
  };

  const filteredRollos = rollos.filter(
    (r) =>
      r.color.toLowerCase().includes(filter.toLowerCase()) ||
      r.codigo.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="app-container">
      <AnimatePresence>
        {confirmModal.show && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
            >
              <div className="modal-icon-warning">
                <AlertTriangle size={40} color="#e11d48" />
              </div>
              <h3>Confirmar acción</h3>
              <p>
                {confirmModal.id === "all"
                  ? "¿Estás seguro de vaciar todo el inventario?"
                  : "¿Deseas eliminar este lote?"}
              </p>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmModal({ show: false, id: null })}
                >
                  CANCELAR
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={ejecutarBorrado}
                >
                  SÍ, ELIMINAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className="sidebar-glass">
        <div className="brand-section">
          <div className="brand-icon-bg">
            <Layers size={22} />
          </div>
          <div className="brand-text">
            <h1>Sedny'ssa</h1>
            <p>INVENTORY SYSTEM</p>
          </div>
        </div>

        <div className="system-actions">
          <button className="btn-action-pro btn-pdf" onClick={generarPDF}>
            <FileDown size={18} /> <span>PDF</span>
          </button>
          <button
            className={`btn-action-pro btn-save ${isSaved ? "saved" : ""}`}
            onClick={() => {
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 2000);
            }}
          >
            {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            <span>{isSaved ? "LISTO" : "GUARDAR"}</span>
          </button>
          <button
            className="btn-delete-all-new"
            onClick={() => setConfirmModal({ show: true, id: "all" })}
          >
            <Trash2 size={14} /> VACIAR TODO
          </button>
        </div>

        <div className="reposicion-box scrollable-section">
          <div className="label-header red-text">
            <AlertCircle size={14} /> AGOTADOS ({coloresSinStock.length})
          </div>
          <div className="pill-container">
            {coloresSinStock.map((c) => (
              <div key={c} className="color-pill">
                <span className="indicator red"></span> {c}
              </div>
            ))}
          </div>
        </div>

        <div className="reposicion-box scrollable-section">
          <div className="label-header green-text">
            <CheckCircle2 size={14} /> EN STOCK ({coloresConStock.length})
          </div>
          <div className="pill-container">
            {coloresConStock.map((c) => (
              <div key={c} className="color-pill">
                <span className="indicator green"></span> {c}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="top-nav-glass">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              placeholder="Buscar por lote o color..."
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="status-badge">
            <div className="pulse-container">
              <div className="pulse-dot"></div>
              <div className="pulse-ring"></div>
            </div>
            <div className="status-info">
              <span className="s-label">SISTEMA</span>
              <span className="s-value">ACTIVO</span>
            </div>
          </div>
        </header>

        <section className="metrics-grid">
          <MetricCard
            title="Agotados"
            value={coloresSinStock.length}
            icon={<ShoppingBag />}
            color="#e11d48"
            desc="Faltantes"
          />
          <MetricCard
            title="Total Lotes"
            value={rollos.length}
            icon={<Package />}
            color="#1e293b"
            desc="Registrados"
          />
          <MetricCard
            title="Variedad"
            value={coloresConStock.length}
            icon={<CheckCircle2 />}
            color="#059669"
            desc="En almacén"
          />
        </section>

        <section className="form-glass-3d">
          <div className="input-field">
            <label>Color</label>
            <select
              value={nuevo.color}
              onChange={(e) => setNuevo({ ...nuevo, color: e.target.value })}
            >
              {COLORS_MASTER.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
            <label>Código Lote</label>
            <input
              value={nuevo.codigo}
              placeholder="Ej: 160"
              onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value })}
            />
          </div>
          <div className="input-field">
            <label>Ancho (m)</label>
            <input
              type="number"
              step="0.1"
              value={nuevo.ancho}
              onChange={(e) =>
                setNuevo({ ...nuevo, ancho: Number(e.target.value) })
              }
            />
          </div>
          <div className="input-field">
            <label>Metros (m)</label>
            <input
              type="number"
              value={nuevo.metros}
              onChange={(e) =>
                setNuevo({ ...nuevo, metros: Number(e.target.value) })
              }
            />
          </div>
          <button className="btn-add-stock-premium" onClick={agregarRollo}>
            <div className="btn-content">
              <Plus size={20} />
              <span>AGREGAR</span>
            </div>
          </button>
        </section>

        <div className="table-glass-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>LOTE</th>
                <th>DESCRIPCIÓN</th>
                <th>ANCHO</th>
                <th>METRAJE</th>
                <th style={{ textAlign: "center" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredRollos.map((r) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <td>
                      <span className="lote-tag">#{r.codigo}</span>
                    </td>
                    <td>
                      Seda Otis <span className="color-name">{r.color}</span>
                    </td>
                    <td>
                      <span className="unit-tag">{r.ancho}m</span>
                    </td>
                    <td>
                      <span className="m-val">{r.metros}m</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="del-btn-table"
                        onClick={() =>
                          setConfirmModal({ show: true, id: r.id })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, color, desc }: any) {
  return (
    <div className="m-card" style={{ borderBottom: `4px solid ${color}` }}>
      <div className="m-icon" style={{ color, background: `${color}10` }}>
        {icon}
      </div>
      <div className="m-info">
        <h4>{title}</h4>
        <h3>{value}</h3>
        <span className="m-desc">{desc}</span>
      </div>
    </div>
  );
}
