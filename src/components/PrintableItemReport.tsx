
// src/components/PrintableItemReport.tsx
'use client'; // If using hooks or event handlers, though for printing, this might not be strictly needed if props are just passed.

import type { Item, HistoryEntry } from '@/lib/types';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface PrintableItemReportProps {
  warehouseName: string;
  item: Item;
  printedBy: string;
  printDate: Date;
}

// Helper function to translate history types
const translateHistoryType = (type: HistoryEntry['type']): string => {
  switch (type) {
    case 'CREATE_ITEM': return 'إنشاء عنصر';
    case 'ADD_STOCK': return 'إضافة مخزون';
    case 'CONSUME_STOCK': return 'استهلاك مخزون';
    case 'ADJUST_STOCK': return 'تعديل مخزون';
    default: return type;
  }
};

export function PrintableItemReport({ warehouseName, item, printedBy, printDate }: PrintableItemReportProps) {
  // Sort history by timestamp, newest first for the report
  const sortedHistory = [...(item.history || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl', padding: '20px', width: '210mm', margin: '0 auto' }} id="printable-content">
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
          #printable-report-area { /* Ensure this ID is on the temporary div in the main page */
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
            text-align: right;
          }
          .print-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="print-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18pt', margin: '0 0 5px 0' }}>تقرير سجل معاملات العنصر</h1>
        <p style={{ fontSize: '12pt', margin: '0' }}>المستودع: {warehouseName}</p>
      </div>

      <div style={{ marginBottom: '15px', fontSize: '11pt' }}>
        <p><strong>اسم العنصر:</strong> {item.name}</p>
        <p><strong>الكمية الحالية:</strong> {item.quantity}</p>
        <p><strong>تاريخ الطباعة:</strong> {format(printDate, "PPpp", { locale: arSA })}</p>
        <p><strong>تمت الطباعة بواسطة:</strong> {printedBy}</p>
      </div>

      <h2 style={{ fontSize: '14pt', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        سجل المعاملات
      </h2>
      
      {sortedHistory.length > 0 ? (
        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', backgroundColor: '#f0f0f0' }}>التاريخ</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', backgroundColor: '#f0f0f0' }}>النوع</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>التغيير</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>الكمية قبل</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>الكمية بعد</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', backgroundColor: '#f0f0f0', minWidth: '150px' }}>التعليق</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((entry) => (
              <tr key={entry.id}>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {format(new Date(entry.timestamp), "PPpp", { locale: arSA })}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {translateHistoryType(entry.type)}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap', color: entry.change >= 0 ? 'green' : 'red' }}>
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>{entry.quantityBefore}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{entry.quantityAfter}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', minWidth: '150px' }}>{entry.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: '11pt', textAlign: 'center', marginTop: '20px' }}>لا يوجد سجل معاملات لهذا العنصر.</p>
      )}
      
      <div className="print-footer" style={{ textAlign: 'center', marginTop: '30px', fontSize: '9pt', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>هذا التقرير تم إنشاؤه بواسطة نظام StockPilot لإدارة المخزون.</p>
      </div>
    </div>
  );
}
