import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "src/components/ui/dialog";

import { Button } from "src/components/ui/button";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "src/components/ui/select";

import AutoComplete from "src/components/ui/AutoComplete";

import { Input } from "src/components/ui/input";

import { Label } from "src/components/ui/label";

import {
    Upload,
    FileText,
} from "lucide-react";

import { toast } from "sonner";

import { campaignService } from "src/modules/campaigns/manageCampaigns/services/campaignService";

import { campaignSegmentService } from "src/modules/campaigns/campaignSegment/services/campaignSegmentService";

import { departmentService } from "src/modules/admin/departments/services/departmentService";

interface Props {
    open: boolean;

    onOpenChange: (
        open: boolean
    ) => void;
}

interface Campaign {
    id: number;

    code: string;

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

const SentinelBatchUploadDialog = ({
    open,
    onOpenChange,
}: Props) => {

    const [loading, setLoading] =
        useState(false);

    const [campaigns, setCampaigns] =
        useState<Campaign[]>([]);

    const [segments, setSegments] =
        useState<Segment[]>([]);

    const [departments, setDepartments] =
        useState<Department[]>([]);

    const [campaignId, setCampaignId] =
        useState("");

    const [segmentId, setSegmentId] =
        useState("");

    const [departmentId, setDepartmentId] =
        useState("");

    const [file, setFile] =
        useState<File | null>(null);

    // ✅ FIXED
    const currentDepartment =
        JSON.parse(
            localStorage.getItem("user") || "{}"
        )?.department;

    // ✅ load initial
    useEffect(() => {

        if (!open) return;

        loadInitialData();

    }, [open]);

    const loadInitialData = async () => {

        try {

            setLoading(true);

            const [
                campaignRes,
                departmentRes,
            ] = await Promise.all([
                campaignService.getCampaigns(),

                departmentService.getActiveDepartmentsList(),
            ]);

            setCampaigns(campaignRes || []);

            // ✅ department logic
            const allDepartments =
                departmentRes || [];

            let filteredDepartments =
                allDepartments.filter(
                    (d: Department) => {

                        if (
                            currentDepartment === "DataOps"
                        ) {
                            return [
                                "DataOps",
                                "DBR",
                            ].includes(d.name);
                        }

                        return (
                            d.name === currentDepartment
                        );
                    }
                );

            setDepartments(filteredDepartments);

            // ✅ auto select if only one
            if (
                filteredDepartments.length === 1
            ) {
                setDepartmentId(
                    String(
                        filteredDepartments[0].id
                    )
                );
            }

        } catch {

            toast.error(
                "Failed to load data"
            );

        } finally {

            setLoading(false);
        }
    };

    // ✅ load segments
    useEffect(() => {

        if (!campaignId) {

            setSegments([]);

            setSegmentId("");

            return;
        }

        loadSegments();

    }, [campaignId]);

    const loadSegments = async () => {

        try {

            const res =
                await campaignSegmentService.getSegmentsByCampaignId(
                    Number(campaignId)
                );

            setSegments(res || []);

        } catch {

            setSegments([]);
        }
    };

    // ✅ reset
    useEffect(() => {

        if (!open) {

            setCampaignId("");

            setSegmentId("");

            setDepartmentId("");

            setFile(null);

            setSegments([]);
        }

    }, [open]);

    const isDisabled =
        !campaignId ||
        !segmentId ||
        !departmentId ||
        !file;

    // ✅ upload
    const handleUpload = async () => {

        try {

            const payload = {
                campaign_id: campaignId,
                segment_id: segmentId,
                department_id: departmentId,
                file,
            };

            console.log(payload);

            toast.success(
                "Batch uploaded successfully"
            );

            onOpenChange(false);

        } catch {

            toast.error(
                "Upload failed"
            );
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >

            <DialogContent className="max-w-5xl p-0 overflow-hidden">

                {/* HEADER */}
                <DialogHeader className="px-6 py-5 border-b bg-lightprimary/30 dark:bg-white/5">

                    <DialogTitle className="text-xl">
                        Upload Sentinel Batch
                    </DialogTitle>

                    <DialogDescription>
                        Upload and configure batch processing details.
                    </DialogDescription>

                </DialogHeader>

                {/* BODY */}
                <div className="px-6 py-6 space-y-6">

                    {/* GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* CAMPAIGN */}
                        <div className="space-y-2">

                            <Label>
                                Campaign
                            </Label>

                            <AutoComplete
                                value={campaignId}
                                onChange={(
                                    value
                                ) => {
                                    setCampaignId(
                                        value
                                    );
                                }}
                                placeholder="Select campaign"
                                options={campaigns.map(
                                    (c) => ({
                                        label:
                                            `${c.code} - ${c.campaign_name}`,

                                        value:
                                            String(c.id),
                                    })
                                )}
                            />

                        </div>

                        {/* SEGMENT */}
                        <div className="space-y-2">

                            <Label>
                                Campaign Segment
                            </Label>

                            <AutoComplete
                                value={segmentId}
                                onChange={
                                    setSegmentId
                                }
                                placeholder="Select segment"
                                options={segments.map(
                                    (s) => ({
                                        label:
                                            `${s.segment_code} - ${s.title}`,

                                        value:
                                            String(s.id),
                                    })
                                )}
                                disabled={!campaignId}
                            />

                        </div>

                    </div>

                    {/* DEPARTMENT */}
                    <div className="space-y-2">

                        <Label>
                            Department
                        </Label>

                        <Select
                            value={departmentId}
                            onValueChange={
                                setDepartmentId
                            }
                        >

                            <SelectTrigger className="h-11">

                                <SelectValue placeholder="Select department" />

                            </SelectTrigger>

                            <SelectContent>

                                {departments.map(
                                    (d) => (

                                        <SelectItem
                                            key={d.id}
                                            value={String(d.id)}
                                        >
                                            {d.name}
                                        </SelectItem>
                                    )
                                )}

                            </SelectContent>

                        </Select>

                    </div>

                    {/* FILE */}
                    <div className="space-y-2">

                        <Label>
                            Upload File
                        </Label>

                        <div className="border border-dashed border-border rounded-xl p-6 bg-muted/20">

                            <label className="flex flex-col items-center justify-center text-center cursor-pointer">

                                <div className="h-14 w-14 rounded-2xl bg-lightprimary flex items-center justify-center mb-3">

                                    <Upload
                                        size={28}
                                        className="text-primary"
                                    />

                                </div>

                                <p className="font-medium mb-1">
                                    Click to upload file
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    CSV, XLSX supported
                                </p>

                                <Input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {

                                        const selected =
                                            e.target.files?.[0];

                                        if (
                                            selected
                                        ) {
                                            setFile(
                                                selected
                                            );
                                        }
                                    }}
                                />

                            </label>

                            {/* FILE PREVIEW */}
                            {file && (

                                <div className="mt-5 flex items-center gap-3 rounded-lg border bg-background p-3">

                                    <FileText
                                        size={20}
                                        className="text-primary"
                                    />

                                    <div className="flex-1 min-w-0">

                                        <p className="text-sm font-medium truncate">
                                            {file.name}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {(
                                                file.size /
                                                1024
                                            ).toFixed(1)} KB
                                        </p>

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <DialogFooter className="px-6 py-4 border-t bg-muted/20">

                    <Button
                        variant="lighterror"
                        onClick={() =>
                            onOpenChange(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="lightprimary"
                        disabled={
                            isDisabled ||
                            loading
                        }
                        onClick={handleUpload}
                    >

                        {loading
                            ? "Loading..."
                            : "Upload Batch"}

                    </Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>
    );
};

export default SentinelBatchUploadDialog;