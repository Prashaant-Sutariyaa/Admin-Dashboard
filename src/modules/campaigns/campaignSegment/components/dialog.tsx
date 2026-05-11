import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "src/components/ui/dialog";

import { Button } from "src/components/ui/button";
import { Textarea } from "src/components/ui/textarea";

interface Row {
    rowIndex?: number;

    id?: number;

    title: string;

    segment_code?: string;

    deficit: number;

    unrealized_reason?: string;
}

interface Props {
    open: boolean;
    rows: Row[];

    onClose: () => void;

    onSubmit: (
        reasons: Record<number, string>
    ) => void;
}

const UnrealizedReasonDialog = ({
    open,
    rows,
    onClose,
    onSubmit,
}: Props) => {

    const [reasons, setReasons] = useState<
        Record<number, string>
    >({});

    // ✅ reset on open
    useEffect(() => {
        if (open) {
            const initial: Record<number, string> = {};

            rows.forEach((r, idx) => {
                initial[idx] = r.unrealized_reason || "";
            });

            setReasons(initial);
        }
    }, [open, rows]);

    const handleChange = (
        index: number,
        value: string
    ) => {
        setReasons((prev) => ({
            ...prev,
            [index]: value,
        }));
    };

    const isValid = rows.every(
        (_, idx) => reasons[idx]?.trim()
    );

    const handleSubmit = () => {
        if (!isValid) return;

        onSubmit(reasons);
    };

    // ✅ Enter submit
    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();

            if (isValid) {
                handleSubmit();
            }
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >

            <DialogContent className="max-w-3xl">

                <DialogHeader>

                    <DialogTitle>
                        Unrealized Value Reason Required
                    </DialogTitle>

                    <DialogDescription>
                        Some completed segments still contain deficit values.
                        Please provide a reason for each segment before continuing.
                    </DialogDescription>

                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">

                    {rows.map((row, idx) => (

                        <div
                            key={idx}
                            className="
                                border
                                border-border
                                rounded-md
                                p-4
                                bg-muted/20
                                space-y-3
                            "
                        >

                            <div className="space-y-1">

                                <div className="font-medium text-sm">
                                    {row.title}
                                </div>

                                <div className="text-xs text-primary">
                                    {row.segment_code}
                                </div>

                                <div className="text-sm text-warningemphasis">
                                    Deficit: {row.deficit}
                                </div>

                            </div>

                            <Textarea
                                value={reasons[idx] || ""}
                                onChange={(e) =>
                                    handleChange(
                                        idx,
                                        e.target.value
                                    )
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Enter unrealized reason..."
                                required
                            />

                        </div>

                    ))}

                </div>

                <DialogFooter>

                    <Button
                        variant="lighterror"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="lightprimary"
                        disabled={!isValid}
                        onClick={handleSubmit}
                    >
                        Continue Save
                    </Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>
    );
};

export default UnrealizedReasonDialog;