import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, } from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "src/components/ui/select";
import AutoComplete from "src/components/ui/AutoComplete";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { campaignService } from "src/modules/campaigns/manageCampaigns/services/campaignService";
import { campaignSegmentService } from "src/modules/campaigns/campaignSegment/services/campaignSegmentService";
import { departmentService } from "src/modules/admin/departments/services/departmentService";

import DataOpsCsv from "src/config/sample-csv-files/DataOps_Upload_Sample.csv?url";
import DBRCsv from "src/config/sample-csv-files/DBR_Upload_Sample.csv?url";
import EmailCsv from "src/config/sample-csv-files/Email_Upload_Sample.csv?url";
import MISCsv from "src/config/sample-csv-files/MIS_Upload_Sample.csv?url";
import QualityCsv from "src/config/sample-csv-files/Quality_Upload_Sample.csv?url";
import VVCsv from "src/config/sample-csv-files/VV_Upload_Sample.csv?url";
import { SentinelBatchesService } from "../services/SentinelBatchesService";

// ── Interfaces ────────────────────────────────────────────────

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentDepartment: string;
}

interface Campaign {
    id: number;
    code?: string;
    campaign_name: string;
}

interface Segment {
    id: number;
    segment_code: string;
    title: string;
}

interface Department {
    id: number;
    name: string;
}

interface HeaderValidation {
    valid: boolean;
    missing: string[];
    extra: string[];
}

interface RowIssue {
    label: string;
    count: number;
}

interface RowValidationResult {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    issues: RowIssue[];
    canUpload: boolean;

    invalidRowData: {
        headers: string[];
        rows: string[][];
        reasons: string[];
    };

    validRowData: {
        headers: string[];
        rows: string[][];
    };

    originalHeaders: string[];
}

const normalizeKey = (...values: string[]) => values.map((v) => v.trim().toLowerCase()).join('__');

// ── Constants ─────────────────────────────────────────────────

const DEPT_KEY_MAP: Record<string, string> = {
    'DataOps': 'DataOps',
    'Email': 'Email',
    'Quality': 'Quality',
    'DBR': 'DBR',
    'Voice Verification': 'VV',
    'MIS': 'MIS',
};

const CSV_MAP: Record<string, string> = {
    'DataOps': DataOpsCsv,
    'Email': EmailCsv,
    'Quality': QualityCsv,
    'DBR': DBRCsv,
    'Voice Verification': VVCsv,
    'MIS': MISCsv,
};

const MAX_ROWS = 50000;

const MANDATORY_HEADERS: Record<string, string[]> = {
    DataOps: [
        'dataops agent',
        'first name',
        'last name',
        'work email',
        'country',
        'contact linkedin profile',
        'company linkedin profile',
        'job title',
        'domain',
        'tal company name',
        'email validation status',
    ],
    Email: [
        'batch id',
        'email agent',
        'work email',
        'email status',
    ],
    Quality: [
        'batch id',
        'quality agent',
        'first name',
        'last name',
        'work email',
        'country',
        'contact linkedin profile',
        'company linkedin profile',
        'job title',
        'domain',
        'tal company name',
        'quality status',
    ],
    DBR: [
        'batch id',
        'dbr agent',
        'first name',
        'last name',
        'work email',
        'country',
        'contact linkedin profile',
        'company linkedin profile',
        'job title',
        'domain',
        'tal company name',
        'dbr status',
    ],
    VV: [
        'batch id',
        'vv agent',
        'work email',
        'vv disposition',
    ],
    MIS: [
        'batch id',
        'mis agent',
        'work email',
        'mis status',
    ],
};

const ENUM_RULES: Record<string, Record<string, string[]>> = {
    DataOps: {
        'email validation status': ['valid', 'invalid', 'catch-all', 'unknown', 'catch_all', 'ok', 'apollo verify', 'verified'],
    },
    Email: {
        'email status': [
            'delivered', 'opened', 'clicked',
            'soft bounce', 'hard bounce', 'unsubscribed', 'invalid',
        ],
    },
    Quality: {
        'quality status': ['qualified', 'disqualified'],
    },
    DBR: {
        'dbr status': ['yes', 'no'],
    },
    MIS: {
        'mis status': [
            'rtd', 'tbd', 'delivered', 'accepted',
            'internal rejected', 'client rejected', 'high cpc',
        ],
    },
};

const CONDITIONAL_REQUIRED: Record<
    string,
    { triggerCol: string; triggerValues: string[]; requiredCol: string; label: string }[]
> = {
    Email: [
        {
            triggerCol: 'email status',
            triggerValues: ['soft bounce', 'hard bounce'],
            requiredCol: 'email reason',
            label: 'Email reason missing (required for Soft/Hard Bounce)',
        },
    ],
    Quality: [
        {
            triggerCol: 'quality status',
            triggerValues: ['disqualified'],
            requiredCol: 'quality reason',
            label: 'Quality reason missing (required for Disqualified)',
        },
    ],
};

const LINKEDIN_PERSONAL_FIELD: Record<string, string> = {
    DataOps: 'contact linkedin profile',
    Quality: 'contact linkedin profile',
    DBR: 'contact linkedin profile',
};

const LINKEDIN_COMPANY_FIELD: Record<string, string> = {
    DataOps: 'company linkedin profile',
    Quality: 'company linkedin profile',
    DBR: 'company linkedin profile',
};
const COUNTRY_VALIDATION_DEPARTMENTS = [
    'DataOps',
    'Quality',
    'DBR',
];
const INDUSTRY_VALIDATION_DEPARTMENTS = [
    'DataOps',
    'Quality',
    'DBR',
];

// ── Helpers ───────────────────────────────────────────────────

const getSampleFileName = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
};

const isEmpty = (value: string): boolean => value === '' || value.trim() === '' || value.trim() === '-';

// FIX: only allow personal LinkedIn URLs (linkedin.com/in/...), not company URLs
const isValidPersonalLinkedIn = (url: string): boolean =>
    /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/.+/i.test(url.trim());

const isValidCompanyLinkedIn = (url: string): boolean =>
    /^(https?:\/\/)?(www\.)?linkedin\.com\/(company|school)\/.+/i.test(url.trim());

const cleanText = (text: string): string => text.replace(/^\uFEFF/, '').replace(/\r/g, '');

const cleanCellValue = (value: string): string => {
    const cleaned = value
        .replace(/^[\s\u0000-\u001F\u007F\u00A0\u200B-\u200D\uFEFF]+/, '')
        .replace(/[\s\u0000-\u001F\u007F\u00A0\u200B-\u200D\uFEFF]+$/, '');

    return cleaned === '-' ? '' : cleaned;
};

// ── CSV parser — handles quoted fields with embedded commas/newlines ──
const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];

    let row: string[] = [];
    let cell = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (insideQuotes && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        }
        else if (char === ',' && !insideQuotes) {
            row.push(cleanCellValue(cell));
            cell = '';
        }
        else if (char === '\n' && !insideQuotes) {
            row.push(cleanCellValue(cell));

            if (row.some(v => v !== '')) {
                rows.push(row);
            }

            row = [];
            cell = '';
        }
        else {
            cell += char;
        }
    }

    row.push(cleanCellValue(cell));

    if (row.some(v => v !== '')) {
        rows.push(row);
    }

    return rows;
};
const fetchSampleHeaders = async (url: string): Promise<string[]> => {
    const res = await fetch(url);
    const text = cleanText(await res.text());
    const parsed = parseCSV(text);
    return (parsed[0] || []).map((h) => h.toLowerCase());
};

const parseUploadedFile = (
    file: File,
): Promise<{ headers: string[]; originalHeaders: string[]; rows: string[][]; rowCount: number }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = cleanText(e.target?.result as string);
            const parsedRows = parseCSV(text);
            if (parsedRows.length === 0) {
                return reject(new Error('Empty file'));
            }

            const originalHeaders = parsedRows[0];
            const headers = originalHeaders.map((h) => h.toLowerCase());
            const rows = parsedRows.slice(1);

            resolve({
                headers,
                originalHeaders,
                rows,
                rowCount: rows.length,
            });
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

const validateHeaders = (sampleHeaders: string[], uploadedHeaders: string[]): HeaderValidation => {
    const sampleSet = new Set(sampleHeaders);
    const uploadedSet = new Set(uploadedHeaders);
    return {
        valid: sampleHeaders.every((h) => uploadedSet.has(h)) && uploadedHeaders.every((h) => sampleSet.has(h)),
        missing: sampleHeaders.filter((h) => !uploadedSet.has(h)),
        extra: uploadedHeaders.filter((h) => !sampleSet.has(h)),
    };
};

// ── Row validation ────────────────────────────────────────────
// Changes:
//   1. Removed all `break` statements — every check runs for every row
//   2. Per-row reasons array collected for the "Invalid Reason" CSV column
//   3. LinkedIn fix: empty mandatory LinkedIn field now flagged correctly
//   4. validRowData returned for building the upload payload

const validateRows = (
    deptKey: string,
    headers: string[],
    originalHeaders: string[],
    rows: string[][],
    countries: any[] = [],
    // industries: any[] = [],
    vvDispositions: string[] = []): RowValidationResult => {

    const mandatoryHeaders = MANDATORY_HEADERS[deptKey] ?? [];

    const enumRules = {
        ...(ENUM_RULES[deptKey] ?? {}),
        ...(deptKey === 'VV' ? { 'vv disposition': vvDispositions } : {}),
    };

    const conditionalRules = CONDITIONAL_REQUIRED[deptKey] ?? [];
    const linkedInField = LINKEDIN_PERSONAL_FIELD[deptKey] ?? null;
    const companyLinkedInField = LINKEDIN_COMPANY_FIELD[deptKey] ?? null;
    const validCountries = new Set(
        countries.map((c) =>
            String(c.name).trim().toLowerCase()
        )
    );
    // const validIndustries = new Set(
    //     industries.map((i) =>
    //         String(i.industry).trim().toLowerCase()
    //     )
    // );

    const issueCounts: Record<string, number> = {
        'Missing required field': 0,
        'Invalid email format': 0,
        'Invalid enum value': 0,
        'Duplicate work email': 0,
        'Duplicate FN + LN + Domain': 0,
        'Duplicate FN + LN + Company': 0,
    };

    if (linkedInField) {
        issueCounts['Invalid Personal LinkedIn URL'] = 0;
        issueCounts['Duplicate Personal LinkedIn URL'] = 0;
    }

    if (companyLinkedInField) {
        issueCounts['Invalid Company LinkedIn URL'] = 0;
    }
    if (COUNTRY_VALIDATION_DEPARTMENTS.includes(deptKey)) {
        issueCounts['Invalid Country'] = 0;
    }
    if (INDUSTRY_VALIDATION_DEPARTMENTS.includes(deptKey)) {
        issueCounts['Invalid Industry'] = 0;
    }

    conditionalRules.forEach((r) => {
        issueCounts[r.label] = 0;
    });

    const emailColIdx = headers.indexOf('work email');
    const batchColIdx = headers.indexOf('batch id');
    const linkedInColIdx = linkedInField ? headers.indexOf(linkedInField) : -1;
    const firstNameColIdx = headers.indexOf('first name');
    const lastNameColIdx = headers.indexOf('last name');
    const domainColIdx = headers.indexOf('domain');
    const companyColIdx = headers.indexOf('tal company name');

    const duplicateEmailKeys = new Set<string>();
    const duplicateLinkedInKeys = new Set<string>();
    const duplicateFnLnDomainKeys = new Set<string>();
    const duplicateFnLnCompanyKeys = new Set<string>();

    // ── WORK EMAIL DUPLICATES ─────────────────────────────────

    if (emailColIdx !== -1) {
        const freq: Record<string, number> = {};
        rows.forEach((row) => {
            const email = (row[emailColIdx] ?? '').trim().toLowerCase();
            const batchId = batchColIdx !== -1 ? (row[batchColIdx] ?? '').trim().toLowerCase() : '';
            if (!email) return;
            const key = deptKey === 'DataOps' ? email : `${batchId}__${email}`;
            freq[key] = (freq[key] ?? 0) + 1;
        });
        Object.entries(freq).forEach(([key, count]) => {
            if (count > 1) duplicateEmailKeys.add(key);
        });
    }

    // ── LINKEDIN DUPLICATES ───────────────────────────────────

    if (linkedInField && linkedInColIdx !== -1) {
        const freq: Record<string, number> = {};
        rows.forEach((row) => {
            const val = (row[linkedInColIdx] ?? '').trim().toLowerCase();
            if (!val || isEmpty(val)) return;
            freq[val] = (freq[val] ?? 0) + 1;
        });
        Object.entries(freq).forEach(([val, count]) => {
            if (count > 1) duplicateLinkedInKeys.add(val);
        });
    }

    // ── FN + LN + DOMAIN DUPLICATES ───────────────────────────

    if (firstNameColIdx !== -1 && lastNameColIdx !== -1 && domainColIdx !== -1) {
        const freq: Record<string, number> = {};
        rows.forEach((row) => {
            const firstName = (row[firstNameColIdx] ?? '').trim().toLowerCase();
            const lastName = (row[lastNameColIdx] ?? '').trim().toLowerCase();
            const domain = (row[domainColIdx] ?? '').trim().toLowerCase();
            if (!firstName || !lastName || !domain) return;
            const key = normalizeKey(firstName, lastName, domain);
            freq[key] = (freq[key] ?? 0) + 1;
        });
        Object.entries(freq).forEach(([key, count]) => {
            if (count > 1) duplicateFnLnDomainKeys.add(key);
        });
    }

    // ── FN + LN + COMPANY DUPLICATES ─────────────────────────

    if (firstNameColIdx !== -1 && lastNameColIdx !== -1 && companyColIdx !== -1) {
        const freq: Record<string, number> = {};
        rows.forEach((row) => {
            const firstName = (row[firstNameColIdx] ?? '').trim().toLowerCase();
            const lastName = (row[lastNameColIdx] ?? '').trim().toLowerCase();
            const company = (row[companyColIdx] ?? '').trim().toLowerCase();
            if (!firstName || !lastName || !company) return;
            const key = normalizeKey(firstName, lastName, company);
            freq[key] = (freq[key] ?? 0) + 1;
        });
        Object.entries(freq).forEach(([key, count]) => {
            if (count > 1) duplicateFnLnCompanyKeys.add(key);
        });
    }

    // ── ROW VALIDATION ────────────────────────────────────────

    let validRows = 0;
    const invalidRowIndices = new Set<number>();
    // per-row reasons: index matches rows array index
    const rowReasons: string[] = new Array(rows.length).fill('');

    rows.forEach((row, rowIndex) => {
        const rowMap: Record<string, string> = {};
        headers.forEach((h, i) => { rowMap[h] = row[i] ?? ''; });

        // collect all reasons for this row
        const reasons: string[] = [];

        // ── REQUIRED FIELDS
        // FIX: no break — check every mandatory field and collect all missing ones
        const missingFields: string[] = [];
        for (const field of mandatoryHeaders) {
            if (isEmpty(rowMap[field] ?? '')) {
                missingFields.push(field);
            }
        }
        if (missingFields.length > 0) {
            issueCounts['Missing required field'] += missingFields.length;
            reasons.push(`Missing required field: ${missingFields.join(', ')}`);
        }

        // ── EMAIL FORMAT
        const workEmail = (rowMap['work email'] ?? '').trim();
        if (workEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
            issueCounts['Invalid email format']++;
            reasons.push('Invalid email format');
        }

        // ── EMAIL DUPLICATE
        if (workEmail) {
            const batchId = (rowMap['batch id'] ?? '').trim().toLowerCase();
            const key = deptKey === 'DataOps'
                ? workEmail.toLowerCase()
                : `${batchId}__${workEmail.toLowerCase()}`;
            if (duplicateEmailKeys.has(key)) {
                issueCounts['Duplicate work email']++;
                reasons.push('Duplicate work email');
            }
        }

        // ── LINKEDIN VALIDATION
        // FIX: check both empty AND invalid/duplicate — not mutually exclusive with required check
        if (linkedInField) {
            const linkedin = (rowMap[linkedInField] ?? '').trim();
            if (!isEmpty(linkedin)) {
                // non-empty: validate format then duplicate
                if (!isValidPersonalLinkedIn(linkedin)) {
                    issueCounts['Invalid Personal LinkedIn URL']++;
                    reasons.push('Invalid Personal LinkedIn URL');
                } else if (duplicateLinkedInKeys.has(linkedin.toLowerCase())) {
                    issueCounts['Duplicate Personal LinkedIn URL']++;
                    reasons.push('Duplicate Personal LinkedIn URL');
                }
            }
            // if empty: already caught by required fields check above — no double-count
        }

        if (companyLinkedInField) {
            const companyLinkedIn = (rowMap[companyLinkedInField] ?? '').trim();
            if (!isEmpty(companyLinkedIn)) {
                if (!isValidCompanyLinkedIn(companyLinkedIn)) {
                    issueCounts['Invalid Company LinkedIn URL']++;
                    reasons.push('Invalid Company LinkedIn URL');
                }
            }
        }

        if (COUNTRY_VALIDATION_DEPARTMENTS.includes(deptKey)) {
            const country = (rowMap['country'] ?? '').trim().toLowerCase();
            if (!isEmpty(country) && !validCountries.has(country)) {
                issueCounts['Invalid Country']++;
                reasons.push('Invalid Country');
            }
        }

        // if (INDUSTRY_VALIDATION_DEPARTMENTS.includes(deptKey)) {
        //     const industry = (rowMap['industry'] ?? '').trim().toLowerCase();
        //     if (!isEmpty(industry) && !validIndustries.has(industry)) {
        //         issueCounts['Invalid Industry']++;
        //         reasons.push('Invalid Industry');
        //     }
        // }

        // ── FN + LN + DOMAIN DUPLICATE
        const firstName = (rowMap['first name'] ?? '').trim().toLowerCase();
        const lastName = (rowMap['last name'] ?? '').trim().toLowerCase();
        const domain = (rowMap['domain'] ?? '').trim().toLowerCase();
        const company = (rowMap['tal company name'] ?? '').trim().toLowerCase();

        if (firstName && lastName && domain) {
            const key = normalizeKey(firstName, lastName, domain);
            if (duplicateFnLnDomainKeys.has(key)) {
                issueCounts['Duplicate FN + LN + Domain']++;
                reasons.push('Duplicate FN + LN + Domain');
            }
        }

        // ── FN + LN + COMPANY DUPLICATE
        if (firstName && lastName && company) {
            const key = normalizeKey(firstName, lastName, company);
            if (duplicateFnLnCompanyKeys.has(key)) {
                issueCounts['Duplicate FN + LN + Company']++;
                reasons.push('Duplicate FN + LN + Company');
            }
        }

        // ── ENUM VALIDATION
        // FIX: no break — check every enum column and collect all violations
        for (const [col, allowed] of Object.entries(enumRules)) {
            const cellVal = (rowMap[col] ?? '').trim();
            if (cellVal && !allowed.includes(cellVal.toLowerCase())) {
                issueCounts['Invalid enum value']++;
                reasons.push(`Invalid value for "${col}": "${cellVal}"`);
            }
        }

        // ── CONDITIONAL REQUIRED
        for (const rule of conditionalRules) {
            const triggerVal = (rowMap[rule.triggerCol] ?? '').trim().toLowerCase();
            if (rule.triggerValues.includes(triggerVal)) {
                if (isEmpty(rowMap[rule.requiredCol] ?? '')) {
                    issueCounts[rule.label]++;
                    reasons.push(rule.label);
                }
            }
        }

        // ── FINAL RESULT
        if (reasons.length > 0) {
            invalidRowIndices.add(rowIndex);
            rowReasons[rowIndex] = reasons.join(', ');
        } else {
            validRows++;
        }
    });

    const totalRows = rows.length;
    const invalidRows = totalRows - validRows;

    const issues = Object.entries(issueCounts)
        .filter(([, count]) => count > 0)
        .map(([label, count]) => ({ label, count }));

    // invalid rows — with per-row reasons collected
    const invalidRowsFiltered = rows
        .map((row, i) => ({ row, reason: rowReasons[i], isInvalid: invalidRowIndices.has(i) }))
        .filter((r) => r.isInvalid);

    const invalidRowData = {
        headers: originalHeaders,
        rows: invalidRowsFiltered.map((r) => r.row),
        reasons: invalidRowsFiltered.map((r) => r.reason),
    };

    const validRowData = {
        headers: originalHeaders,
        rows: rows.filter(
            (_, i) => !invalidRowIndices.has(i)
        ),
    };

    return {
        totalRows,
        validRows,
        invalidRows,
        issues,
        canUpload: validRows > 0,
        invalidRowData,
        validRowData,
        originalHeaders,
    };
};

// ── CSV cell escaper (RFC 4180) ───────────────────────────────

const escapeCSVCell = (cell: string): string => {
    const needsQuoting =
        cell.includes(',') ||
        cell.includes('"') ||
        cell.includes('\n') ||
        cell.includes('\r');
    if (!needsQuoting) return cell;
    return `"${cell.replace(/"/g, '""')}"`;
};

// ── Build a CSV string from headers + rows ────────────────────

const buildCSVString = (headers: string[], rows: string[][]): string =>
    [
        headers.map(escapeCSVCell).join(','),
        ...rows.map((row) => row.map((cell) => escapeCSVCell(cell ?? '')).join(',')),
    ].join('\n');

// ── Download invalid rows CSV (adds "Invalid Reason" column) ──

const downloadInvalidRowsCSV = (headers: string[], rows: string[][], reasons: string[], originalFileName: string) => {
    const headersWithReason = [...headers, 'Invalid Reason'];
    const rowsWithReason = rows.map((row, i) => [...row, reasons[i] ?? '']);

    const csvContent = buildCSVString(headersWithReason, rowsWithReason);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = originalFileName.replace(/\.csv$/i, '');
    link.href = url;
    link.download = `${baseName}_invalid_rows.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// ── Build a File object from valid rows only (for upload) ─────

const buildValidRowsFile = (headers: string[], rows: string[][], originalFileName: string): File => {
    const csvContent = buildCSVString(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return new File([blob], originalFileName, { type: 'text/csv' });
};

// ── Component ─────────────────────────────────────────────────

const SentinelBatchUploadDialog = ({ open, currentDepartment, onOpenChange }: Props) => {
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [vvDispositions, setVvDispositions] = useState<string[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [, setIndustries] = useState<any[]>([]);
    const [campaignId, setCampaignId] = useState('');
    const [segmentId, setSegmentId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [file, setFile] = useState<File | null>(null);
    const [headerValidation, setHeaderValidation] = useState<HeaderValidation | null>(null);
    const [rowValidation, setRowValidation] = useState<RowValidationResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedDepartment = departments.find((d) => String(d.id) === departmentId);
    const sampleFile = selectedDepartment ? CSV_MAP[selectedDepartment.name] : null;
    const sampleFileName = sampleFile ? getSampleFileName(sampleFile) : null;
    const deptKey = selectedDepartment ? (DEPT_KEY_MAP[selectedDepartment.name] ?? selectedDepartment.name) : '';
    const disableDepartmentSelect = !['DataOps', 'Management'].includes(currentDepartment);

    useEffect(() => {
        if (!open) return;
        loadInitialData();
    }, [open]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [campaignRes, departmentRes, dispositionsRes, countriesRes, industriesRes] = await Promise.all([
                campaignService.getAllCampaigns(),
                departmentService.getActiveDepartmentsList(),
                SentinelBatchesService.getDispostionsData(),
                SentinelBatchesService.getCountriesData(),
                SentinelBatchesService.getIndustryData(),
            ]);
            setCampaigns(campaignRes || []);
            const vvDispositionList = (dispositionsRes?.data || []).map(
                (item: any) => item.call_disposition.toLowerCase()
            );
            setCountries(countriesRes || []);
            setIndustries(industriesRes || []);
            setVvDispositions(vvDispositionList);

            const allDepartments = departmentRes || [];
            let allowedDepartments: string[] = [];

            if (currentDepartment === 'DataOps') {
                allowedDepartments = ['DataOps', 'DBR'];
            } else if (currentDepartment === 'Management') {
                allowedDepartments = ['DataOps', 'Email', 'Quality', 'DBR', 'Voice Verification', 'MIS'];
            } else {
                allowedDepartments = [currentDepartment];
            }

            const filteredDepartments = allDepartments.filter((d: Department) =>
                allowedDepartments.includes(d.name),
            );
            setDepartments(filteredDepartments);

            if (filteredDepartments.length === 1) {
                setDepartmentId(String(filteredDepartments[0].id));
            }
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!campaignId) { setSegments([]); setSegmentId(''); return; }
        loadSegments();
    }, [campaignId]);

    const loadSegments = async () => {
        try {
            const res = await campaignSegmentService.getSegmentsByCampaignId(Number(campaignId));
            setSegments(res || []);
        } catch {
            setSegments([]);
        }
    };

    useEffect(() => {
        if (!open) {
            setPriority('Normal');
            setCampaignId('');
            setSegmentId('');
            setDepartmentId('');
            setFile(null);
            setSegments([]);
            setHeaderValidation(null);
            setRowValidation(null);
            setIsDragging(false);
        }
    }, [open]);

    useEffect(() => {
        setFile(null);
        setHeaderValidation(null);
        setRowValidation(null);
        setCampaignId('');
        setSegmentId('');
    }, [departmentId]);

    const processFile = async (selected: File) => {
        if (!selected.name.endsWith('.csv')) {
            toast.error('Only CSV files are supported');
            return;
        }

        setFile(selected);
        setHeaderValidation(null);
        setRowValidation(null);

        if (!sampleFile || !selectedDepartment || !deptKey) return;

        try {
            setValidating(true);

            const [sampleHeaders, { headers: uploadedHeaders, originalHeaders, rows, rowCount }] = await Promise.all([
                fetchSampleHeaders(sampleFile),
                parseUploadedFile(selected),
            ]);

            if (rowCount > MAX_ROWS) {
                toast.error(`File too large — max ${MAX_ROWS.toLocaleString()} rows. Your file has ${rowCount.toLocaleString()} rows.`);
                setFile(null);
                return;
            }

            if (rowCount === 0) {
                toast.error('File has no data rows.');
                setFile(null);
                return;
            }

            const hResult = validateHeaders(sampleHeaders, uploadedHeaders);
            setHeaderValidation(hResult);

            if (hResult.valid) {
                const rResult = validateRows(deptKey, uploadedHeaders, originalHeaders, rows, countries,
                    // industries, 
                    vvDispositions);
                setRowValidation(rResult);

                if (rResult.invalidRows === 0) {
                    toast.success(`File validated — ${rResult.validRows.toLocaleString()} rows ready to upload`);
                } else if (rResult.canUpload) {
                    toast.warning(`${rResult.invalidRows.toLocaleString()} rows have issues — ${rResult.validRows.toLocaleString()} valid rows will be uploaded`);
                } else {
                    toast.error('No valid rows found — please fix your file');
                }
            }
        } catch {
            toast.error('Failed to validate file');
            setFile(null);
        } finally {
            setValidating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) processFile(selected);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!departmentId) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!departmentId) return;
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) processFile(dropped);
    };

    const handleUpload = async () => {
        if (!headerValidation?.valid || !rowValidation || !rowValidation.canUpload || !file || !selectedDepartment) {
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();

            formData.append('department', selectedDepartment.name);
            formData.append('total_rows', String(rowValidation.totalRows));
            formData.append('valid_rows', String(rowValidation.validRows));
            formData.append('invalid_rows', String(rowValidation.invalidRows));

            if (shouldShowCampaignFields) {
                const selectedCampaign = campaigns.find((c) => String(c.id) === campaignId);
                const selectedSegment = segments.find((s) => String(s.id) === segmentId);
                if (!selectedCampaign || !selectedSegment) {
                    toast.error('Invalid campaign or segment selection');
                    return;
                }
                formData.append('campaign_code', selectedCampaign.code ?? '');
                formData.append('segment_code', selectedSegment.segment_code);
                formData.append('priority', priority);
            }

            // FIX: build a new CSV file from valid rows only instead of sending the original file
            // This ensures invalid rows are never sent to the backend
            const uploadFile = rowValidation.invalidRows > 0
                ? buildValidRowsFile(
                    rowValidation.validRowData.headers,
                    rowValidation.validRowData.rows,
                    file.name,
                )
                : file; // all rows valid — send original file as-is

            formData.append('file', uploadFile);

            await SentinelBatchesService.uploadSentinelBatch(formData);
            toast.success('Batch uploaded successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                'Upload failed'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvalid = () => {
        if (!rowValidation?.invalidRowData || !file) return;
        downloadInvalidRowsCSV(
            rowValidation.invalidRowData.headers,
            rowValidation.invalidRowData.rows,
            rowValidation.invalidRowData.reasons,
            file.name,
        );
    };

    const shouldShowCampaignFields = selectedDepartment?.name === 'DataOps';

    const isDisabled =
        (shouldShowCampaignFields && (!campaignId || !segmentId)) ||
        !departmentId ||
        !file ||
        !headerValidation?.valid ||
        !rowValidation?.canUpload ||
        validating ||
        loading;

    const showRowSummaryInHeader = headerValidation?.valid && rowValidation;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl p-0 overflow-hidden max-h-[90vh] flex flex-col">

                {/* ── HEADER ── */}
                <div className="px-6 py-4 border-b bg-lightprimary/30 dark:bg-white/5 shrink-0">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-base font-semibold text-foreground">Upload Sentinel Batch</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Upload and configure batch processing details.</p>
                        </div>

                        {showRowSummaryInHeader && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className="text-successemphasis shrink-0" />
                                    <span className="text-xs font-semibold text-successemphasis">
                                        {rowValidation!.validRows.toLocaleString()} valid
                                    </span>
                                </div>
                                {rowValidation!.invalidRows > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <AlertCircle size={14} className="text-warningemphasis shrink-0" />
                                        <span className="text-xs font-semibold text-warningemphasis">
                                            {rowValidation!.invalidRows.toLocaleString()} issues
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {showRowSummaryInHeader && rowValidation!.issues.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
                            {rowValidation!.issues.map((issue) => (
                                <div key={issue.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                                    <span>{issue.label}</span>
                                    <span className="font-semibold text-warningemphasis">{issue.count.toLocaleString()} rows</span>
                                </div>
                            ))}
                            {rowValidation!.invalidRows > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDownloadInvalid}
                                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primaryemphasis transition-colors ml-auto"
                                >
                                    <Download size={12} />
                                    Download invalid rows
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── BODY ── */}
                <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

                    {/* DataOps Only */}
                    {shouldShowCampaignFields && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label>Campaign</Label>
                                <AutoComplete
                                    value={campaignId}
                                    onChange={(value) => setCampaignId(value)}
                                    placeholder="Select campaign"
                                    options={campaigns.map((c) => ({
                                        label: `${c.code} - ${c.campaign_name}`,
                                        value: String(c.id),
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Campaign Segment</Label>
                                <AutoComplete
                                    value={segmentId}
                                    onChange={setSegmentId}
                                    placeholder="Select segment"
                                    options={segments.map((s) => ({
                                        label: `${s.segment_code} - ${s.title}`,
                                        value: String(s.id),
                                    }))}
                                    disabled={!campaignId}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Normal">Normal</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Department + Sample CSV */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={departmentId} onValueChange={setDepartmentId} disabled={disableDepartmentSelect}>
                                <SelectTrigger className="w-full h-11">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Sample CSV</Label>
                            {sampleFileName ? (
                                <div className="h-11 flex items-center gap-2.5 px-3 rounded-md border border-border bg-muted/40">
                                    <Icon icon="solar:file-text-linear" width={16} className="text-primary shrink-0" />
                                    <span className="text-sm text-foreground truncate flex-1">{sampleFileName}</span>
                                    <button
                                        type="button"
                                        onClick={() => sampleFile && window.open(sampleFile, '_blank')}
                                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                        title="Download sample"
                                    >
                                        <Icon icon="solar:download-linear" width={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="h-11 flex items-center px-3 rounded-md border border-border bg-muted/20">
                                    <span className="text-sm text-muted-foreground">Select a department first</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                        <Label>Upload File</Label>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => departmentId && fileInputRef.current?.click()}
                            className={`
                                border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 select-none
                                ${!departmentId
                                    ? 'opacity-50 cursor-not-allowed border-border bg-muted/10'
                                    : isDragging
                                        ? 'border-primary bg-lightprimary/40 cursor-copy scale-[1.005]'
                                        : 'border-border hover:border-primary hover:bg-muted/20 cursor-pointer bg-muted/10'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors
                                    ${isDragging ? 'bg-primary text-white' : 'bg-lightprimary text-primary'}`}
                                >
                                    <Upload size={22} />
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    CSV only · Max {MAX_ROWS.toLocaleString()} rows
                                </p>
                            </div>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* File preview */}
                        {file && (
                            <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
                                <FileText size={18} className="text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                {validating && (
                                    <Icon icon="solar:spinner-linear" width={18} className="animate-spin text-muted-foreground shrink-0" />
                                )}
                                {!validating && headerValidation?.valid && rowValidation?.invalidRows === 0 && (
                                    <CheckCircle2 size={18} className="text-success shrink-0" />
                                )}
                                {!validating && ((headerValidation && !headerValidation.valid) || (rowValidation && rowValidation.invalidRows > 0)) && (
                                    <AlertCircle size={18} className="text-warning shrink-0" />
                                )}
                            </div>
                        )}

                        {/* Header validation errors */}
                        {headerValidation && !headerValidation.valid && (
                            <div className="rounded-lg border border-error/30 bg-lighterror/50 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={16} className="text-erroremphasis shrink-0" />
                                    <p className="text-sm font-semibold text-erroremphasis">
                                        Header mismatch — please fix your file
                                    </p>
                                </div>
                                {headerValidation.missing.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                            Missing columns ({headerValidation.missing.length})
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {headerValidation.missing.map((h) => (
                                                <span key={h} className="text-xs px-2 py-0.5 rounded-md bg-lighterror text-erroremphasis font-medium border border-error/20">
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {headerValidation.extra.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                            Extra columns ({headerValidation.extra.length})
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {headerValidation.extra.map((h) => (
                                                <span key={h} className="text-xs px-2 py-0.5 rounded-md bg-lightwarning text-warningemphasis font-medium border border-warning/20">
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Download the sample CSV to see the correct column structure.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0">
                    <Button variant="lighterror" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="lightprimary" disabled={isDisabled} onClick={handleUpload}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Icon icon="solar:spinner-linear" width={14} className="animate-spin" />
                                Uploading...
                            </span>
                        ) : validating ? (
                            <span className="flex items-center gap-2">
                                <Icon icon="solar:spinner-linear" width={14} className="animate-spin" />
                                Validating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload size={14} />
                                {rowValidation?.canUpload && rowValidation.invalidRows > 0
                                    ? `Upload ${rowValidation.validRows.toLocaleString()} Valid Rows`
                                    : 'Upload Batch'
                                }
                            </span>
                        )}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
};

export default SentinelBatchUploadDialog