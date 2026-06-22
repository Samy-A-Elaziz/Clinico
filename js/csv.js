/**
 * Clinico Structured RFC-4180 Compliant CSV Engine
 * Manages bidirectional translation between internal state arrays and flat tabular csv strings.
 */
const csvEngine = {
    
    /**
     * Converts a flat array of key-value client records into an RFC-4180 compliant CSV string.
     * Handles complex string serialization, quotation masking, and structured object nesting.
     * @param {Array<Object>} records - Raw application patient arrays
     * @returns {string} Fully structured output csv string
     */
    stringify: function(records) {
        if (records.length === 0) return '';
        
        // Define clean standard flat database schema mapping
        const headers = [
            'id', 'petName', 'ownerName', 'age', 'weight', 'species', 'breed', 'sex', 'neutered',
            'imageUrl', 'about', 'complain', 'symptoms', 'syndrome', 'diagnosis', 'treatment',
            'xray', 'ct', 'mri', 'fluoroscopy', 'ultrasound', 'echography',
            'cbc', 'biochemistry', 'urinalysis', 'cytology', 'otherLab',
            'pdf', 'word', 'excel', 'externalFiles'
        ];

        let csvLines = [];
        csvLines.push(headers.join(','));

        records.forEach(rec => {
            let lineValues = headers.map(header => {
                let value = rec[header] || '';
                
                // If the field target is an array asset, flatten array using internal ';' separators
                if (Array.isArray(value)) {
                    value = value.filter(str => str.trim() !== '').join(';');
                }
                
                // Escape characters according to standard system CSV conventions
                let cleanStr = String(value).replace(/"/g, '""');
                if (cleanStr.includes(',') || cleanStr.includes('"') || cleanStr.includes('\n') || cleanStr.includes(';')) {
                    cleanStr = `"${cleanStr}"`;
                }
                return cleanStr;
            });
            csvLines.push(lineValues.join(','));
        });

        return csvLines.join('\n');
    },

    /**
     * Parses standard compliant tabular CSV strings into nested JavaScript data objects.
     * @param {string} csvText - Input tabular database stream content
     * @returns {Array<Object>} Extracted and structured patient record objects
     */
    parse: function(csvText) {
        const records = [];
        if (!csvText || csvText.trim() === '') return records;

        let lines = [];
        let row = [''];
        let inQuotes = false;

        // Character level tokenizer matrix parser loop execution
        for (let i = 0; i < csvText.length; i++) {
            let c = csvText[i];
            let next = csvText[i+1];

            if (c === '"') {
                if (inQuotes && next === '"') { 
                    row[row.length - 1] += '"'; 
                    i++; 
                } else { 
                    inQuotes = !inQuotes; 
                }
            } else if (c === ',' && !inQuotes) {
                row.push('');
            } else if ((c === '\r' || c === '\n') && !inQuotes) {
                if (c === '\r' && next === '\n') { i++; }
                lines.push(row);
                row = [''];
            } else {
                row[row.length - 1] += c;
            }
        }
        if (row.length > 1 || row[0] !== '') {
            lines.push(row);
        }

        if (lines.length < 2) return records;
        
        const headers = lines[0].map(h => h.trim());
        
        // Define fields which store multiple semi-colon separated URLs
        const arrayFields = [
            'xray', 'ct', 'mri', 'fluoroscopy', 'ultrasound', 'echography',
            'cbc', 'biochemistry', 'urinalysis', 'cytology', 'otherLab',
            'pdf', 'word', 'excel', 'externalFiles'
        ];

        for (let j = 1; j < lines.length; j++) {
            let values = lines[j];
            if (values.length !== headers.length) continue; // Skip corrupted rows

            let patientObj = {};
            headers.forEach((header, idx) => {
                let rawVal = values[idx] || '';
                
                if (arrayFields.includes(header)) {
                    patientObj[header] = rawVal ? rawVal.split(';').map(u => u.trim()).filter(u => u !== '') : [];
                } else {
                    patientObj[header] = rawVal;
                }
            });

            if (patientObj.id && patientObj.petName) {
                records.push(patientObj);
            }
        }

        return records;
    },

    /**
     * Packages memory states and triggers client file system downloads of the static 'clinico.csv' architecture.
     */
    exportToCSV: function() {
        const data = app.getMemoryStorage();
        const csvContent = this.stringify(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "clinico.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};