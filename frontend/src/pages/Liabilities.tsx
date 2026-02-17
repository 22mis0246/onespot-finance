import { useEffect, useState } from "react";
import axios from "axios";

interface Liability {
  id: number;
  title: string;
  type: string;
  totalAmount: number;
  outstanding: number;
  interestRate: number;
  createdAt: string;
}

export default function Liabilities() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "Personal Loan",
    totalAmount: "",
    interestRate: "",
  });

  const token = localStorage.getItem("token");

  const fetchLiabilities = async () => {
    const res = await axios.get("http://localhost:4000/api/liabilities", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLiabilities(res.data);
  };

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const handleAdd = async () => {
    await axios.post(
      "http://localhost:4000/api/liabilities",
      {
        title: form.title,
        type: form.type,
        totalAmount: Number(form.totalAmount),
        outstanding: Number(form.totalAmount),
        interestRate: Number(form.interestRate),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setShowModal(false);
    setForm({
      title: "",
      type: "Personal Loan",
      totalAmount: "",
      interestRate: "",
    });

    fetchLiabilities();
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:4000/api/liabilities/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLiabilities();
  };

  const totalOutstanding = liabilities.reduce(
    (acc, l) => acc + l.outstanding,
    0
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Liabilities</h1>

      {/* SUMMARY CARD */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Total Outstanding</p>
          <h2 style={styles.summaryAmount}>₹ {totalOutstanding}</h2>
        </div>
      </div>

      <button style={styles.addBtn} onClick={() => setShowModal(true)}>
        + Add Liability
      </button>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginBottom: 20 }}>Add Liability</h2>

            <input
              style={styles.input}
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <select
              style={styles.input}
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            >
              <option>Personal Loan</option>
              <option>Home Loan</option>
              <option>Vehicle Loan</option>
              <option>Credit Card</option>
              <option>Education Loan</option>
            </select>

            <input
              style={styles.input}
              type="number"
              placeholder="Total Amount"
              value={form.totalAmount}
              onChange={(e) =>
                setForm({ ...form, totalAmount: e.target.value })
              }
            />

            <input
              style={styles.input}
              type="number"
              placeholder="Interest Rate %"
              value={form.interestRate}
              onChange={(e) =>
                setForm({ ...form, interestRate: e.target.value })
              }
            />

            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button style={styles.saveBtn} onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIABILITY CARDS */}
      <div style={styles.grid}>
        {liabilities.map((l) => (
          <div key={l.id} style={styles.card}>
            <h3 style={styles.cardTitle}>{l.title}</h3>
            <p style={styles.cardType}>{l.type}</p>

            <div style={styles.cardRow}>
              <span>Total:</span>
              <span>₹ {l.totalAmount}</span>
            </div>

            <div style={styles.cardRow}>
              <span>Outstanding:</span>
              <span style={{ color: "#ff6b6b" }}>
                ₹ {l.outstanding}
              </span>
            </div>

            <div style={styles.cardRow}>
              <span>Interest:</span>
              <span>{l.interestRate}%</span>
            </div>

            <button
              style={styles.deleteBtn}
              onClick={() => handleDelete(l.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================
   STYLES (MATCHING  YOUR UI)
======================== */

const styles: any = {
  page: {
    padding: "40px",
    color: "white",
  },

  heading: {
    fontSize: "32px",
    marginBottom: "30px",
  },

  summaryRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },

  summaryCard: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "16px",
    minWidth: "260px",
  },

  summaryLabel: {
    opacity: 0.7,
  },

  summaryAmount: {
    marginTop: "8px",
    color: "#ff6b6b",
  },

  addBtn: {
    background: "#6c63ff",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "18px",
    backdropFilter: "blur(10px)",
  },

  cardTitle: {
    fontSize: "18px",
    marginBottom: "6px",
  },

  cardType: {
    opacity: 0.6,
    marginBottom: "15px",
  },

  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },

  deleteBtn: {
    marginTop: "12px",
    background: "transparent",
    color: "#ff6b6b",
    border: "1px solid #ff6b6b",
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#1e1f3a",
    padding: "30px",
    borderRadius: "16px",
    width: "400px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "none",
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
  },

  cancelBtn: {
    background: "transparent",
    color: "white",
    border: "1px solid gray",
    padding: "8px 14px",
    borderRadius: "8px",
  },

  saveBtn: {
    background: "#6c63ff",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
  },
};
