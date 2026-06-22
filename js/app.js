/**
 * Clinico Comprehensive Application Control Engine
 * Orchestrates rendering, data mutation pipelines, structural dynamic layouts, and validation logic.
 */

// Define baseline premium animal group vector silhouette graphics for missing items
const PLACEHOLDER_PET_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='%230d9488'><path d='M226.5 92.9c14.3 42.9-.3 86.6-32.6 107.4-32.4 20.8-74.8 14.5-97.3-14.8-22.5-29.3-16-74.7 14.3-100.7c30.2-26 77.2-20.7 95.6 18.1zM50.4 278.6c0-39.6 33.3-71.7 74.2-71.7 41 0 74.2 32.1 74.2 71.7s-33.3 71.7-74.2 71.7c-41 .1-74.2-32-74.2-71.7zm387.4-185.7c18.4-38.8 65.4-44.1 95.6-18.1 30.3 26 36.8 71.4 14.3 100.7-22.5 29.3-64.9 35.6-97.3 14.8-32.3-20.8-46.9-64.5-32.6-107.4zm74.2 271.7c0 39.6-33.3 71.7-74.2 71.7-41 0-74.2-32.1-74.2-71.7s33.3-71.7 74.2-71.7c41 0 74.2 32.1 74.2 71.7zM362.4 174.4c-11.4-11.4-29.9-11.4-41.3 0l-2.4 2.4-2.4-2.4c-11.4-11.4-29.9-11.4-41.3 0-11.4 11.4-11.4 29.9 0 41.3l23.7 23.7c11.4 11.4 29.9 11.4 41.3 0l23.7-23.7c11.1-11.4 11.1-29.9-1.3-41.3zM256 244c-19.4 0-35.1 15.7-35.1 35.1s15.7 35.1 35.1 35.1 35.1-15.7 35.1-35.1S275.4 244 256 244z'/></svg>";

const SECURITY_KEY = "clinico123";

// Map repeatable target rows inside structured record sections
const DYNAMIC_LINK_FIELDS = [
    'xray', 'ct', 'mri', 'fluoroscopy', 'ultrasound', 'echography',
    'cbc', 'biochemistry', 'urinalysis', 'cytology', 'otherLab',
    'pdf', 'word', 'excel', 'externalFiles'
];

class ClinicoApp {
    constructor() {
        this.currentView = 'home';
        this.selectedPatientId = null;
        this.securityCallback = null;
        this.initEventListeners();
        this.verifyAndHydrateStorage();
    }

    initEventListeners() {
        // Wire standard binary document parser trigger inputs
        document.getElementById('csv-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const parsedData = csvEngine.parse(evt.target.result);
                if(parsedData.length > 0) {
                    localStorage.setItem('clinico_db', JSON.stringify(parsedData));
                    alert(`Successfully imported ${parsedData.length} records into volatile clinic cache memory.`);
                    this.renderHistory();
                    this.switchView('history');
                } else {
                    alert("Analysis Failed. File format is either empty or does not conform to required clinico headers.");
                }
            };
            reader.readAsText(file);
        });
    }

    verifyAndHydrateStorage() {
        if (!localStorage.getItem('clinico_db')) {
            localStorage.setItem('clinico_db', JSON.stringify([]));
        }
    }

    getMemoryStorage() {
        return JSON.parse(localStorage.getItem('clinico_db')) || [];
    }

    setMemoryStorage(dataArray) {
        localStorage.setItem('clinico_db', JSON.stringify(dataArray));
    }

    switchView(viewName, targetId = null) {
        this.currentView = viewName;
        this.selectedPatientId = targetId;

        // Toggle visual styling of primary navigation menu tabs
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${viewName}`);
        if (activeNav) activeNav.classList.add('active');

        // Deactivate all workspaces, isolate matching current view
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        
        if (viewName === 'home') {
            document.getElementById('view-home').classList.add('active');
        } else if (viewName === 'add') {
            this.prepareFormView(targetId);
            document.getElementById('view-add').classList.add('active');
        } else if (viewName === 'history') {
            this.renderHistory();
            document.getElementById('view-history').classList.add('active');
        } else if (viewName === 'details') {
            this.renderDetailsView(targetId);
            document.getElementById('view-details').classList.add('active');
        }
        window.scrollTo(0, 0);
    }

    /**
     * Dynamically renders standard link rows inside the diagnostic section layout boxes
     */
    prepareFormView(id = null) {
        const form = document.getElementById('patient-form');
        form.reset();
        
        DYNAMIC_LINK_FIELDS.forEach(field => {
            const container = document.getElementById(`wrapper-${field}`);
            // Keep the text header label element intact
            const label = container.querySelector('label');
            container.innerHTML = '';
            container.appendChild(label);
        });

        if (!id) {
            // New record creation mode configuration
            document.getElementById('form-view-title').innerHTML = `<i class="fa-solid fa-file-medical"></i> New Patient Clinical Admission`;
            document.getElementById('field-id').value = '';
            // Append one dynamic row for each asset link group field array element
            DYNAMIC_LINK_FIELDS.forEach(field => this.appendDynamicLinkFieldRow(field, ''));
        } else {
            // Editing an existing record
            document.getElementById('form-view-title').innerHTML = `<i class="fa-solid fa-user-pen"></i> Edit Patient Medical Profile Record`;
            const records = this.getMemoryStorage();
            const record = records.find(r => r.id === id);
            if (!record) return;

            document.getElementById('field-id').value = record.id;
            document.getElementById('field-petName').value = record.petName || '';
            document.getElementById('field-ownerName').value = record.ownerName || '';
            document.getElementById('field-age').value = record.age || '';
            document.getElementById('field-weight').value = record.weight || '';
            document.getElementById('field-species').value = record.species || '';
            document.getElementById('field-breed').value = record.breed || '';
            document.getElementById('field-sex').value = record.sex || '';
            document.getElementById('field-neutered').value = record.neutered || '';
            document.getElementById('field-imageUrl').value = record.imageUrl || '';
            document.getElementById('field-about').value = record.about || '';
            document.getElementById('field-complain').value = record.complain || '';
            document.getElementById('field-symptoms').value = record.symptoms || '';
            document.getElementById('field-syndrome').value = record.syndrome || '';
            document.getElementById('field-diagnosis').value = record.diagnosis || '';
            document.getElementById('field-treatment').value = record.treatment || '';

            // Inject the existing asset paths into matching field group row lines
            DYNAMIC_LINK_FIELDS.forEach(field => {
                const linksArray = record[field];
                if (Array.isArray(linksArray) && linksArray.length > 0) {
                    linksArray.forEach(url => this.appendDynamicLinkFieldRow(field, url));
                } else {
                    this.appendDynamicLinkFieldRow(field, '');
                }
            });
        }
    }

    appendDynamicLinkFieldRow(fieldId, value = '') {
        const wrapper = document.getElementById(`wrapper-${fieldId}`);
        const row = document.createElement('div');
        row.className = 'link-input-row';
        row.innerHTML = `
            <input type="url" placeholder="https://external-cloud-vault-storage/file_path" value="${value}" class="input-url-element">
            <button type="button" class="btn-row-action btn-remove-row" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash-can"></i></button>
        `;
        wrapper.appendChild(row);

        // Append a persistent single line "Add Row" node trigger handle below current array groups if not present
        if (!wrapper.querySelector('.btn-add-row')) {
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'btn-row-action btn-add-row';
            addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Link`;
            addBtn.onclick = () => this.appendDynamicLinkFieldRow(fieldId, '');
            wrapper.appendChild(addBtn);
        } else {
            // Reposition the Add Button to always sit at the bottom of the container
            const currentAddBtn = wrapper.querySelector('.btn-add-row');
            wrapper.appendChild(currentAddBtn);
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        const idField = document.getElementById('field-id').value;
        const records = this.getMemoryStorage();

        // Package all runtime properties from across form element sets
        const recordData = {
            id: idField || 'CLN-' + Math.floor(100000 + Math.random() * 900000),
            petName: document.getElementById('field-petName').value,
            ownerName: document.getElementById('field-ownerName').value,
            age: document.getElementById('field-age').value,
            weight: document.getElementById('field-weight').value,
            species: document.getElementById('field-species').value,
            breed: document.getElementById('field-breed').value,
            sex: document.getElementById('field-sex').value,
            neutered: document.getElementById('field-neutered').value,
            imageUrl: document.getElementById('field-imageUrl').value,
            about: document.getElementById('field-about').value,
            complain: document.getElementById('field-complain').value,
            symptoms: document.getElementById('field-symptoms').value,
            syndrome: document.getElementById('field-syndrome').value,
            diagnosis: document.getElementById('field-diagnosis').value,
            treatment: document.getElementById('field-treatment').value,
        };

        // Extract input strings from across dynamic layout sets 
        DYNAMIC_LINK_FIELDS.forEach(field => {
            const container = document.getElementById(`wrapper-${field}`);
            const inputs = container.querySelectorAll('.input-url-element');
            const values = [];
            inputs.forEach(input => {
                if (input.value.trim() !== '') values.push(input.value.trim());
            });
            recordData[field] = values;
        });

        if (idField) {
            // Update operation tracking logic block
            const idx = records.findIndex(r => r.id === idField);
            if (idx !== -1) records[idx] = recordData;
        } else {
            // Create record initialization mapping logic block
            records.unshift(recordData);
        }

        this.setMemoryStorage(records);
        alert("Clinical encounter profiling successfully updated within structural logs.");
        this.switchView('history');
    }

    renderHistory() {
        const grid = document.getElementById('history-grid');
        grid.innerHTML = '';

        const records = this.getMemoryStorage();
        const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
        const speciesFilter = document.getElementById('filter-species-select').value;

        const filtered = records.filter(rec => {
            const matchesSearch = rec.petName.toLowerCase().includes(searchQuery) || 
                                  rec.id.toLowerCase().includes(searchQuery) ||
                                  (rec.ownerName && rec.ownerName.toLowerCase().includes(searchQuery));
            const matchesSpecies = (speciesFilter === 'ALL') || (rec.species === speciesFilter);
            return matchesSearch && matchesSpecies;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-records-fallback">
                    <i class="fa-solid fa-folder-open"></i>
                    <p>No active case sheets fall under specified clinical lookup query arguments.</p>
                </div>`;
            return;
        }

        filtered.forEach(rec => {
            const imgTarget = rec.imageUrl ? rec.imageUrl : PLACEHOLDER_PET_IMAGE;
            const card = document.createElement('div');
            card.className = 'patient-horizontal-card';
            card.onclick = () => this.switchView('details', rec.id);
            
            card.innerHTML = `
                <div class="card-thumbnail-container">
                    <img src="${imgTarget}" onerror="this.src='${PLACEHOLDER_PET_IMAGE}'" alt="Patient Thumbnail">
                </div>
                <div class="card-body-content">
                    <div class="card-meta-top">
                        <div class="card-title-block">
                            <h3>${rec.petName}</h3>
                            <div class="card-taxonomic-badges">
                                <span class="badge-species">${rec.species}</span>
                                ${rec.breed ? `<span class="badge-breed">${rec.breed}</span>` : ''}
                            </div>
                        </div>
                        <span class="card-id-badge">${rec.id}</span>
                    </div>
                    <p class="card-preview-text"><strong>Summary:</strong> ${rec.about}</p>
                    <div class="card-meta-bottom">
                        <span><i class="fa-solid fa-weight-hanging"></i> Mass: <strong>${rec.weight}</strong></span>
                        <span><i class="fa-solid fa-cake-candles"></i> Chronology: <strong>${rec.age}</strong></span>
                        <span><i class="fa-solid fa-user"></i> Agent: <strong>${rec.ownerName || 'N/A'}</strong></span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderDetailsView(id) {
        const target = document.getElementById('details-view-target');
        const records = this.getMemoryStorage();
        const rec = records.find(r => r.id === id);

        if (!rec) {
            target.innerHTML = `<div class="no-records-fallback"><p>Requested patient file path cannot be extracted.</p></div>`;
            return;
        }

        const profileImg = rec.imageUrl ? rec.imageUrl : PLACEHOLDER_PET_IMAGE;

        // Functional dynamic execution mapping block builder
        const buildHyperlinkNodes = (linkArray) => {
            if (!Array.isArray(linkArray) || linkArray.length === 0) {
                return `<span class="empty-link-txt">No recorded asset telemetry logs mapped.</span>`;
            }
            return linkArray.map((url, index) => `
                <a href="${url}" target="_blank" class="clinical-hyperlink">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Record Link #${index + 1}
                </a>
            `).join('');
        };

        target.innerHTML = `
            <div class="profile-action-header">
                <button class="btn btn-secondary" onclick="app.switchView('history')"><i class="fa-solid fa-chevron-left"></i> Return to Registry</button>
                <div class="profile-action-cluster">
                    <button class="btn btn-primary" onclick="app.requestSecurityAccess('EDIT', '${rec.id}')"><i class="fa-solid fa-user-gear"></i> Unlock & Edit</button>
                    <button class="btn btn-danger" onclick="app.requestSecurityAccess('DELETE', '${rec.id}')"><i class="fa-solid fa-trash-can"></i> Terminate Case</button>
                </div>
            </div>

            <div class="profile-master-grid">
                <div class="profile-sidebar-panel">
                    <div class="profile-avatar-card">
                        <div class="profile-avatar-wrapper">
                            <img src="${profileImg}" onerror="this.src='${PLACEHOLDER_PET_IMAGE}'" alt="Patient Profile">
                        </div>
                        <div class="profile-identity-block">
                            <h2>${rec.petName}</h2>
                            <span class="system-id">${rec.id}</span>
                        </div>
                    </div>

                    <div class="vitals-list-panel">
                        <h4><i class="fa-solid fa-fingerprint"></i> Biometric Profile</h4>
                        <div class="vital-row"><span class="vital-label">Taxonomy:</span><span class="vital-value">${rec.species}</span></div>
                        <div class="vital-row"><span class="vital-label">Breed Class:</span><span class="vital-value">${rec.breed || 'Unclassified'}</span></div>
                        <div class="vital-row"><span class="vital-label">Chronology:</span><span class="vital-value">${rec.age}</span></div>
                        <div class="vital-row"><span class="vital-label">Mass Metrics:</span><span class="vital-value">${rec.weight}</span></div>
                        <div class="vital-row"><span class="vital-label">Sex Assignment:</span><span class="vital-value">${rec.sex}</span></div>
                        <div class="vital-row"><span class="vital-label">Neutered Status:</span><span class="vital-value">${rec.neutered}</span></div>
                        <div class="vital-row"><span class="vital-label">Owner/Agent:</span><span class="vital-value">${rec.ownerName || 'N/A'}</span></div>
                    </div>
                </div>

                <div class="profile-main-report">
                    <div class="clinical-block-card">
                        <h3><i class="fa-solid fa-clipboard-list"></i> Clinical Assessment History</h3>
                        <p class="narrative-p"><strong>Background & Traits:</strong>\n${rec.about}</p>
                    </div>

                    <div class="clinical-block-card">
                        <h3><i class="fa-solid fa-stethoscope"></i> Symptom Profile & Diagnosis Matrix</h3>
                        <div class="clinical-subgrid">
                            <div class="subgrid-cell"><h4>Chief Complaint</h4><p>${rec.complain || 'None documented.'}</p></div>
                            <div class="subgrid-cell"><h4>Observed Symptoms</h4><p>${rec.symptoms || 'None recorded.'}</p></div>
                            <div class="subgrid-cell"><h4>Syndrome Map Matrix</h4><p>${rec.syndrome || 'None isolated.'}</p></div>
                            <div class="subgrid-cell"><h4>Working Diagnosis</h4><p style="color: var(--secondary); font-weight: 600;">${rec.diagnosis || 'Pending configuration.'}</p></div>
                        </div>
                    </div>

                    <div class="clinical-block-card">
                        <h3><i class="fa-solid fa-kit-medical"></i> Therapeutic Execution Protocols</h3>
                        <p class="narrative-p" style="border-left-color: var(--accent);">${rec.treatment || 'No clinical intervention tracks configured at this juncture.'}</p>
                    </div>

                    <div class="clinical-block-card">
                        <h3><i class="fa-solid fa-folder-tree"></i> Cloud Diagnostics Asset Matrix</h3>
                        <div class="asset-link-matrix">
                            <div class="asset-card-node">
                                <h4><i class="fa-solid fa-radiation"></i> X-Ray Array Links</h4>
                                <div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.xray)}</div>
                            </div>
                            <div class="asset-card-node">
                                <h4><i class="fa-solid fa-wave-square"></i> Computed Tomography (CT)</h4>
                                <div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.ct)}</div>
                            </div>
                            <div class="asset-card-node">
                                <h4><i class="fa-solid fa-magnet"></i> Magnetic Resonance Imaging (MRI)</h4>
                                <div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.mri)}</div>
                            </div>
                            <div class="asset-card-node">
                                <h4><i class="fa-solid fa-bolt"></i> Fluoroscopy Stream Array</h4>
                                <div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.fluoroscopy)}</div>
                            </div>
                            <div class="asset-card-node">
                                <h4><i class="fa-solid fa-heart-pulse"></i> Sonar Ultrasound Nodes</h4>
                                <div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.ultrasound)}</div>
                            </div>
                            <div class="asset-card-node">
                                <h4><i class="fa-solid fa-baby"></i> Echography Maps</h4>
                                <div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.echography)}</div>
                            </div>
                        </div>
                    </div>

                    <div class="clinical-block-card">
                        <h3><i class="fa-solid fa-microscope"></i> Pathology Laboratory Manifests</h3>
                        <div class="asset-link-matrix">
                            <div class="asset-card-node"><h4>CBC Panels</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.cbc)}</div></div>
                            <div class="asset-card-node"><h4>Clinical Biochemistry</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.biochemistry)}</div></div>
                            <div class="asset-card-node"><h4>Urinalysis Metrics</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.urinalysis)}</div></div>
                            <div class="asset-card-node"><h4>Cytology Array Logs</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.cytology)}</div></div>
                        </div>
                        <div class="asset-card-node" style="margin-top: 16px;">
                            <h4><i class="fa-solid fa-vial"></i> Alternative Specialized Labs</h4>
                            <div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.otherLab)}</div>
                        </div>
                    </div>

                    <div class="clinical-block-card">
                        <h3><i class="fa-solid fa-paperclip"></i> Documentation & Structured Attachments</h3>
                        <div class="asset-link-matrix">
                            <div class="asset-card-node"><h4>PDF Clinical Bulletins</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.pdf)}</div></div>
                            <div class="asset-card-node"><h4>Word Manuscripts (.docx)</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.word)}</div></div>
                            <div class="asset-card-node"><h4>Excel Analytical Sheets (.xlsx)</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.excel)}</div></div>
                            <div class="asset-card-node"><h4>External Vault Manifests</h4><div class="asset-hyperlinks-list">${buildHyperlinkNodes(rec.externalFiles)}</div></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Intercepts modification loops and queries authorization credentials
     */
    requestSecurityAccess(mode, id) {
        const modal = document.getElementById('security-modal');
        const passInput = document.getElementById('security-password-input');
        const errorMsg = document.getElementById('security-error');
        const promptTxt = document.getElementById('security-prompt-text');
        const confirmBtn = document.getElementById('security-confirm-btn');

        passInput.value = '';
        errorMsg.style.display = 'none';
        
        if (mode === 'EDIT') {
            promptTxt.innerText = "You are attempting to modify an active clinical case record. Enter auth key:";
        } else if (mode === 'DELETE') {
            promptTxt.innerText = "WARNING: Critical destructive deletion track initialized. Provide authorization credentials to execute:";
        }

        modal.classList.add('active');
        passInput.focus();

        // Bind closure tracking execution callbacks directly
        confirmBtn.onclick = () => {
            if (passInput.value === SECURITY_KEY) {
                modal.classList.remove('active');
                if (mode === 'EDIT') {
                    this.switchView('add', id);
                } else if (mode === 'DELETE') {
                    if (confirm("Confirm permanently purging this patient case record from the local session view cache?")) {
                        let records = this.getMemoryStorage();
                        records = records.filter(r => r.id !== id);
                        this.setMemoryStorage(records);
                        alert("Case sheet deleted successfully.");
                        this.switchView('history');
                    }
                }
            } else {
                errorMsg.style.display = 'block';
                passInput.select();
            }
        };
    }

    closeSecurityModal() {
        document.getElementById('security-modal').classList.remove('active');
    }
}

// Initializing Application Core Workspace Environment Frame
const app = new ClinicoApp();
