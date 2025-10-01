export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers || Object.keys(data[0]);
  const headerRow = csvHeaders.join(',');
  const dataRows = data.map(row => 
    csvHeaders.map(header => {
      let value = row[header];
      
      // Handle different data types
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        // For arrays or objects, convert to string
        if (Array.isArray(value)) {
          value = value.length;
        } else {
          value = JSON.stringify(value);
        }
      } else {
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      }
      
      return value;
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
};

export const downloadCSV = (data, filename, headers = null) => {
  try {
    const csv = convertToCSV(data, headers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

export const generateTextReport = (data, title = "Report") => {
  if (!data || data.length === 0) return `${title}\n\nNo data available.`;
  
  let report = `${title}\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n`;
  report += `Total Records: ${data.length}\n`;
  report += '='.repeat(50) + '\n\n';
  
  // Add data rows
  data.forEach((item, index) => {
    report += `Record ${index + 1}:\n`;
    Object.entries(item).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      let formattedValue = value;
      if (Array.isArray(value)) {
        formattedValue = `${value.length} items`;
      } else if (typeof value === 'object' && value !== null) {
        formattedValue = JSON.stringify(value);
      } else if (value === null || value === undefined) {
        formattedValue = 'N/A';
      }
      
      report += `  ${formattedKey}: ${formattedValue}\n`;
    });
    report += '\n';
  });
  
  return report;
};

export const downloadTextReport = (data, filename, title = "Report") => {
  try {
    const reportContent = generateTextReport(data, title);
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading text report:', error);
    return false;
  }
};

export const formatStudentDataForExport = (students) => {
  return students.map(student => ({
    'Roll Number': student.rollNo,
    'Name': student.name,
    'Year': student.year,
    'Late Days': student.lateDays,
    'Status': student.status,
    'Fines (₹)': student.fines,
    'Grace Period Used': student.gracePeriodUsed,
    'Limit Exceeded': student.limitExceeded ? 'Yes' : 'No',
    'In Grace Period': student.isInGracePeriod ? 'Yes' : 'No',
    'Total Late Records': student.lateLogs ? student.lateLogs.length : 0
  }));
};

export const formatLateRecordsForExport = (records, period = '') => {
  const formatted = [];
  
  records.forEach(student => {
    if (student.lateLogs && student.lateLogs.length > 0) {
      student.lateLogs.forEach(log => {
        formatted.push({
          'Roll Number': student.rollNo,
          'Name': student.name,
          'Year': student.year,
          'Late Date': new Date(log.date).toLocaleDateString(),
          'Late Time': new Date(log.date).toLocaleTimeString(),
          'Current Late Days': student.lateDays,
          'Current Fines (₹)': student.fines,
          'Status': student.status
        });
      });
    }
  });
  
  return formatted;
};

export const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
};