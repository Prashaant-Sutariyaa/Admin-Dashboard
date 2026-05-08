import CardBox from "src/components/shared/CardBox";

import {
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

import { formatCurrencyNumber } from "src/utils/formatCurrencyNumber";

interface Props {
    data?: {
        booked_leads?: number;
        accepted_leads?: number;
        deficit_leads?: number;
        booked_revenue?: number;
        accepted_revenue?: number;
        revenue_pending?: number;
    };

    loading?: boolean;
}

const RevenueStats = ({
    data,
    loading,
}: Props) => {

    const stats = [
        {
            key: "booked",

            title: "Booked",

            leads:
                formatCurrencyNumber(
                    data?.booked_leads || 0
                ),

            revenue: `$ ${formatCurrencyNumber(
                data?.booked_revenue || 0
            )}`,

            icon: TrendingUp,

            bg:
                "bg-primary/12 dark:bg-primary/12",

            text:
                "text-primary",
        },

        {
            key: "accepted",

            title: "Accepted",

            leads:
                formatCurrencyNumber(
                    data?.accepted_leads || 0
                ),

            revenue: `$ ${formatCurrencyNumber(
                data?.accepted_revenue || 0
            )}`,

            icon: CheckCircle2,

            bg:
                "bg-success/12 dark:bg-success/12",

            text:
                "text-successemphasis",
        },

        {
            key: "deficit",

            title: "Deficit",

            leads:
                formatCurrencyNumber(
                    data?.deficit_leads || 0
                ),

            revenue: `$ ${formatCurrencyNumber(
                data?.revenue_pending || 0
            )}`,

            icon: AlertTriangle,

            bg:
                "bg-error/12 dark:bg-error/12",

            text:
                "text-erroremphasis",
        },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {stats.map((item) => {

                const Icon = item.icon;

                return (
                    <CardBox
                        key={item.key}
                        className={`
                            border-none
                            shadow-sm
                            hover:shadow-md
                            transition-all duration-300
                            ${item.bg}
                            group
                        `}
                    >

                        {loading ? (

                            <div className="h-[92px] animate-pulse rounded-lg bg-muted" />

                        ) : (

                            <div className="flex items-center gap-4 group-hover:-translate-y-0.5 transition-transform duration-300">

                                {/* ICON */}
                                <div className="shrink-0">

                                    <div className="h-14 w-14 rounded-2xl bg-background/80 flex items-center justify-center">

                                        <Icon
                                            size={28}
                                            className={item.text}
                                        />

                                    </div>

                                </div>

                                {/* CONTENT */}
                                <div className="flex-1 min-w-0">

                                    {/* TITLE */}
                                    <p className={`text-sm font-semibold mb-3 ${item.text}`}>
                                        {item.title}
                                    </p>

                                    {/* STATS */}
                                    <div className="flex items-center justify-between gap-6">

                                        {/* LEADS */}
                                        <div>

                                            <p className="text-xs text-muted-foreground mb-1">
                                                Leads
                                            </p>

                                            <h4 className={`text-xl font-bold leading-none ${item.text}`}>
                                                {item.leads}
                                            </h4>

                                        </div>

                                        {/* DIVIDER */}
                                        <div className="h-10 w-px bg-border" />

                                        {/* REVENUE */}
                                        <div>

                                            <p className="text-xs text-muted-foreground mb-1">
                                                Revenue
                                            </p>

                                            <h4 className={`text-xl font-bold leading-none ${item.text}`}>
                                                {item.revenue}
                                            </h4>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        )}

                    </CardBox>
                );
            })}

        </div>
    );
};

export default RevenueStats;