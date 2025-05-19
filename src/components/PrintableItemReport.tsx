
// src/components/PrintableItemReport.tsx
'use client'; 

import type { Item, HistoryEntry } from '@/lib/types';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale'; // For Arabic date formatting if needed, though current app is LTR/English

// Helper to format history types
const translateHistoryType = (type: HistoryEntry['type']): string => {
  switch (type) {
    case 'CREATE_ITEM':
      return 'Item Created';
    case 'ADD_STOCK':
      return 'Stock Added';
    case 'CONSUME_STOCK':
      return 'Stock Consumed';
    case 'ADJUST_STOCK':
      return 'Stock Adjusted';
    default:
      return type.replace('_', ' ');
  }
};


export function PrintableItemReport({ warehouseName, item, printedBy, printDate }: PrintableItemReportProps) {
  // Log received props for debugging
  console.log("PrintableItemReport rendering with props:", { warehouseName, item, printedBy, printDate });
  if (item && item.history) {
    console.log("Item history for printing:", item.history);
  } else {
    console.warn("Item or item history is undefined/null in PrintableItemReport");
  }


  const sortedHistory = [...(item?.history || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (!item) {
    return <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>Error: Item data is missing for the report.</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr', padding: '20px', width: '210mm', margin: '0 auto' }} id="printable-content">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact; /* For Chrome, Safari */
            color-adjust: exact; /* Standard */
            margin: 0;
          }
          #printable-report-area { 
            margin: 0;
            padding: 0;
            width: 100%;
          }
          .print-header, .print-footer {
            text-align: center;
            margin-bottom: 15px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 10pt;
          }
          .print-table th, .print-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left; /* Default for LTR */
          }
          .print-table th {
            background-color: #f0f0f0 !important; /* Ensure background prints */
            font-weight: bold;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="print-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18pt', margin: '0 0 5px 0' }}>Item Transaction History Report</h1>
        <p style={{ fontSize: '12pt', margin: '0' }}>Warehouse: {warehouseName || "N/A"}</p>
      </div>

      <div style={{ marginBottom: '15px', fontSize: '11pt' }}>
        <p><strong>Item Name:</strong> {item.name || "N/A"}</p>
        <p><strong>Current Quantity:</strong> {item.quantity !== undefined ? item.quantity : "N/A"}</p>
        <p><strong>Print Date:</strong> {format(printDate, "PPpp")}</p>
        <p><strong>Printed By:</strong> {printedBy || "System"}</p>
      </div>

      <h2 style={{ fontSize: '14pt', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Transaction History
      </h2>
      
      {sortedHistory.length > 0 ? (
        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Type</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Change</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Qty Before</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Qty After</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#f0f0f0', minWidth: '150px' }}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((entry) => (
              <tr key={entry.id}>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {format(new Date(entry.timestamp), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {translateHistoryType(entry.type)}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap', color: entry.change >= 0 ? 'green' : 'red' }}>
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>{entry.quantityBefore}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{entry.quantityAfter}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', minWidth: '150px' }}>{entry.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: '11pt', textAlign: 'center', marginTop: '20px' }}>No transaction history for this item.</p>
      )}
      
      <div className="print-footer" style={{ textAlign: 'center', marginTop: '30px', fontSize: '9pt', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>This report was generated by the StockPilot Inventory Management System.</p>
      </div>
    </div>
  );
}
