
// src/components/PrintableTransactionsReport.tsx
'use client';

import type { HistoryEntry } from '@/lib/types'; // Assuming FlattenedHistoryEntry is based on this
import { format } from 'date-fns';

interface FlattenedHistoryEntry extends HistoryEntry {
  itemName: string;
  warehouseName: string;
  itemId: string;
  warehouseId: string;
}

interface PrintableTransactionsReportProps {
  transactions: FlattenedHistoryEntry[];
  reportTitle: string;
  printedBy: string;
  printDate: Date;
}

const formatHistoryType = (type: HistoryEntry['type']): string => {
  switch (type) {
    case 'CREATE_ITEM': return 'Item Created';
    case 'ADD_STOCK': return 'Stock Added';
    case 'CONSUME_STOCK': return 'Stock Consumed';
    case 'ADJUST_STOCK': return 'Stock Adjusted';
    default: return type.replace(/_/g, ' ');
  }
};

export function PrintableTransactionsReport({ transactions, reportTitle, printedBy, printDate }: PrintableTransactionsReportProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr', padding: '20px', width: '210mm', margin: '0 auto' }} id="printable-content">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
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
            font-size: 9pt; /* Slightly smaller for potentially more data */
          }
          .print-table th, .print-table td {
            border: 1px solid #ccc;
            padding: 6px; /* Adjusted padding */
            text-align: left;
          }
          .print-table th {
            background-color: #f0f0f0 !important;
            font-weight: bold;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="print-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '16pt', margin: '0 0 5px 0' }}>{reportTitle}</h1>
        <p style={{ fontSize: '11pt', margin: '0' }}>Stock Pilot - Transaction Report</p>
      </div>

      <div style={{ marginBottom: '15px', fontSize: '10pt' }}>
        <p><strong>Print Date:</strong> {format(printDate, "yyyy-MM-dd HH:mm:ss")}</p>
        <p><strong>Printed By:</strong> {printedBy}</p>
      </div>

      <h2 style={{ fontSize: '13pt', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Transactions
      </h2>
      
      {transactions.length > 0 ? (
        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Item Name</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Warehouse</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Type</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Change</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>Before</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>After</th>
              <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', backgroundColor: '#f0f0f0', minWidth: '120px' }}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((entry) => (
              <tr key={entry.id + entry.timestamp}> {/* Ensure unique key if IDs are not globally unique */}
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {format(new Date(entry.timestamp), "yyyy-MM-dd HH:mm")}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>{entry.itemName}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>{entry.warehouseName}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  {formatHistoryType(entry.type)}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', whiteSpace: 'nowrap', color: entry.change >= 0 ? 'green' : 'red' }}>
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{entry.quantityBefore}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{entry.quantityAfter}</td>
                <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left', minWidth: '120px', wordBreak: 'break-word' }}>{entry.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: '11pt', textAlign: 'center', marginTop: '20px' }}>No transactions found for this selection.</p>
      )}
      
      <div className="print-footer" style={{ textAlign: 'center', marginTop: '30px', fontSize: '9pt', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>This report was generated by the Stock Pilot Inventory Management System.</p>
      </div>
    </div>
  );
}
