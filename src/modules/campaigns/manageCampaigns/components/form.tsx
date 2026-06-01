import { useState } from 'react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'src/components/ui/select';

import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { campaignService } from '../services/campaignService';
import { Client } from 'src/modules/clients/services/clientService';

import {
    CAMPAIGN_TYPE_OPTIONS,
    DELIVERY_MODE_OPTIONS,
    DELIVERY_METHOD_OPTIONS,
    CAMPAIGN_STATUS_OPTIONS,
    CAMPAIGN_CURRENCY_OPTIONS,
    CAMPAIGN_PRIORITY_OPTIONS,
} from 'src/config/constant-data/campaignOptions';

interface CampaignFormData {
    campaign_name: string;
    campaign_type: string;
    delivery_mode: string;
    delivery_method: string;
    client_id: string;
    status: string;

    start_date: string;
    end_date: string;

    total_allocation: string;
    total_delivered: string;
    total_accepted: string;
    total_rejected: string;

    currency: string;
    cpl: string;
    priority: string;

    campaign_document_name: string;
    campaign_document: string;
    comment: string;
}

interface Props {
    mode: 'create' | 'edit';
    initialData?: Partial<CampaignFormData>;
    clients: Client[];
    onSuccess: () => void;
    campaignId?: number;
}

const CampaignForm = ({
    mode,
    initialData,
    clients,
    onSuccess,
    campaignId,
}: Props) => {

    // ✅ Initialize directly from initialData — no useEffect needed
    // key prop on this component forces a full remount when campaign changes
    const [form, setForm] = useState<CampaignFormData>({
        campaign_name: initialData?.campaign_name ?? '',
        campaign_type: initialData?.campaign_type ?? '',
        delivery_mode: initialData?.delivery_mode ?? '',
        delivery_method: initialData?.delivery_method ?? '',
        client_id: initialData?.client_id ?? '',
        status: initialData?.status ?? '',
        start_date: initialData?.start_date ?? '',
        end_date: initialData?.end_date ?? '',
        total_allocation: initialData?.total_allocation ?? '',
        total_delivered: initialData?.total_delivered ?? '',
        total_accepted: initialData?.total_accepted ?? '',
        total_rejected: initialData?.total_rejected ?? '',
        currency: initialData?.currency ?? '',
        cpl: initialData?.cpl ?? '',
        priority: initialData?.priority ?? '',
        campaign_document_name: initialData?.campaign_document_name ?? '',
        campaign_document: '',
        comment: initialData?.comment ?? '',
    });

    const handleChange = (key: keyof CampaignFormData, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // ✅ FILE → BASE64
    const handleFile = (file: File | null) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm((prev) => ({
                ...prev,
                campaign_document: reader.result as string,
                campaign_document_name: file.name,
            }));
        };
        reader.readAsDataURL(file);
    };

    // ✅ VALIDATION
    const validate = () => {
        if (!form.campaign_name) return 'Campaign name required';
        if (!form.client_id) return 'Client required';
        if (!form.start_date) return 'Start date required';
        if (!form.end_date) return 'End date required';
        return null;
    };

    // ✅ DIFF — only return fields that changed
    const getChangedFields = (original: any, current: any) => {
        const diff: any = {};

        Object.keys(current).forEach((key) => {
            const currentValue = current[key];
            const originalValue = original[key];

            const normalizedCurrent = currentValue === '' || currentValue === null ? undefined : currentValue;
            const normalizedOriginal = originalValue === '' || originalValue === null ? undefined : originalValue;

            if (normalizedCurrent !== normalizedOriginal) {
                diff[key] = currentValue;
            }
        });

        return diff;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        // ✅ Typed current values (numbers converted)
        const current = {
            campaign_name: form.campaign_name,
            campaign_type: form.campaign_type,
            delivery_mode: form.delivery_mode,
            delivery_method: form.delivery_method,
            client_id: Number(form.client_id),
            status: mode === 'create' ? 'Not Started' : form.status,
            start_date: form.start_date,
            end_date: form.end_date,
            total_allocation: Number(form.total_allocation || 0),
            total_delivered: Number(form.total_delivered || 0),
            total_accepted: Number(form.total_accepted || 0),
            total_rejected: Number(form.total_rejected || 0),
            currency: form.currency,
            cpl: Number(form.cpl || 0),
            priority: form.priority,
            campaign_document_name: form.campaign_document_name,
            comment: form.comment,
        };

        try {
            if (mode === 'create') {
                // ✅ Create — send full payload including document
                const payload = {
                    ...current,
                    campaign_document: form.campaign_document,
                };
                await campaignService.createCampaign(payload);
                toast.success('Campaign created');
            } else {
                // ✅ Edit — build original from initialData with same types
                const original = {
                    campaign_name: initialData?.campaign_name ?? '',
                    campaign_type: initialData?.campaign_type ?? '',
                    delivery_mode: initialData?.delivery_mode ?? '',
                    delivery_method: initialData?.delivery_method ?? '',
                    client_id: Number(initialData?.client_id || 0),
                    status: initialData?.status ?? '',
                    start_date: initialData?.start_date ?? '',
                    end_date: initialData?.end_date ?? '',
                    total_allocation: Number(initialData?.total_allocation || 0),
                    total_delivered: Number(initialData?.total_delivered || 0),
                    total_accepted: Number(initialData?.total_accepted || 0),
                    total_rejected: Number(initialData?.total_rejected || 0),
                    currency: initialData?.currency ?? '',
                    cpl: Number(initialData?.cpl || 0),
                    priority: initialData?.priority ?? '',
                    campaign_document_name: initialData?.campaign_document_name ?? '',
                    comment: initialData?.comment ?? '',
                };

                let payload = getChangedFields(original, current);

                // ✅ Only include document if a new file was selected
                if (form.campaign_document) {
                    payload.campaign_document = form.campaign_document;
                    payload.campaign_document_name = form.campaign_document_name;
                }

                if (Object.keys(payload).length === 0) {
                    toast.info('No changes detected');
                    onSuccess();
                    return;
                }

                await campaignService.updateCampaign(campaignId!, payload);
                toast.success('Campaign updated');
            }

            onSuccess();
        } catch (e: any) {
            const msg = e?.response?.data?.detail;

            if (msg === 'Campaign already exists') {
                toast.error('Campaign already exists');
            } else if (msg === 'Campaign exists but is deleted') {
                toast.error('Campaign exists but is deleted');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CAMPAIGN NAME */}
            <div>
                <Label>Campaign Name</Label>
                <Input
                    className="mt-2 w-full"
                    value={form.campaign_name}
                    onChange={(e) => handleChange('campaign_name', e.target.value)}
                />
            </div>

            <div>
                <Label>Campaign Type</Label>
                <Select value={form.campaign_type} onValueChange={(v) => handleChange('campaign_type', v)}>
                    <SelectTrigger className="mt-2 w-full">
                        <SelectValue placeholder="Select Campaign Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {CAMPAIGN_TYPE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {mode === 'edit' && (
                <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                        <SelectTrigger className="mt-2 w-full">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {CAMPAIGN_STATUS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* CLIENT */}
            {mode === 'create' && (
                <div>
                    <Label>Client</Label>
                    <Select value={form.client_id} onValueChange={(v) => handleChange('client_id', v)}>
                        <SelectTrigger className="mt-2 w-full">
                            <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.code} - {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* SELECTS */}


            <div>
                <Label>Delivery Mode</Label>
                <Select value={form.delivery_mode} onValueChange={(v) => handleChange('delivery_mode', v)}>
                    <SelectTrigger className="mt-2 w-full">
                        <SelectValue placeholder="Select Delivery Mode" />
                    </SelectTrigger>
                    <SelectContent>
                        {DELIVERY_MODE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Delivery Method</Label>
                <Select value={form.delivery_method} onValueChange={(v) => handleChange('delivery_method', v)}>
                    <SelectTrigger className="mt-2 w-full">
                        <SelectValue placeholder="Select Delivery Method" />
                    </SelectTrigger>
                    <SelectContent>
                        {DELIVERY_METHOD_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => handleChange('priority', v)}>
                    <SelectTrigger className="mt-2 w-full">
                        <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        {CAMPAIGN_PRIORITY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* START DATE */}
            <div>
                <Label>Start Date</Label>
                <input
                    type="date"
                    value={form.start_date || ''}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* END DATE */}
            <div>
                <Label>End Date</Label>
                <input
                    type="date"
                    value={form.end_date || ''}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* NUMBERS */}
            <div>
                <Label>Total Allocation</Label>
                <Input
                    type='number'
                    className="mt-2 w-full"
                    placeholder="Total Allocation"
                    value={form.total_allocation}
                    onChange={(e) => handleChange('total_allocation', e.target.value)}
                />
            </div>

            <div>
                <Label>Total Delivered</Label>
                <Input
                    type='number'
                    className="mt-2 w-full"
                    placeholder="Total Delivered"
                    value={form.total_delivered}
                    onChange={(e) => handleChange('total_delivered', e.target.value)}
                    disabled
                />
            </div>

            <div>
                <Label>Total Accepted</Label>
                <Input
                    type='number'
                    className="mt-2 w-full"
                    placeholder="Total Accepted"
                    value={form.total_accepted}
                    onChange={(e) => handleChange('total_accepted', e.target.value)}
                    disabled
                />
            </div>

            <div>
                <Label>Total Rejected</Label>
                <Input
                    type='number'
                    className="mt-2 w-full"
                    placeholder="Total Rejected"
                    value={form.total_rejected}
                    onChange={(e) => handleChange('total_rejected', e.target.value)}
                    disabled
                />
            </div>

            <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => handleChange('currency', v)}>
                    <SelectTrigger className="mt-2 w-full">
                        <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {CAMPAIGN_CURRENCY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>CPL</Label>
                <Input
                    className="mt-2 w-full"
                    placeholder="CPL"
                    value={form.cpl}
                    onChange={(e) => handleChange('cpl', e.target.value)}
                />
            </div>

            {/* FILE */}
            <div>
                <div >
                    <Label>Campaign Document</Label>
                    <div className="mt-2 flex items-center gap-3 border border-border rounded-md px-3 py-2">
                        <Icon icon="solar:file-linear" width={18} />
                        <input
                            type="file"
                            className="w-full text-sm bg-transparent outline-none"
                            onChange={(e) => handleFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>
            </div>

            {/* COMMENT */}
            <div className="md:col-span-2">
                <Label>Comment</Label>
                <textarea
                    value={form.comment || ''}
                    onChange={(e) => handleChange('comment', e.target.value)}
                    rows={4}
                    className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter comment..."
                />
            </div>

            {/* ACTIONS */}
            <div className="md:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="lighterror" onClick={onSuccess}>
                    Cancel
                </Button>
                <Button type="submit" variant="lightprimary">
                    {mode === 'create' ? 'Create Campaign' : 'Update Campaign'}
                </Button>
            </div>

        </form>
    );
};

export default CampaignForm;