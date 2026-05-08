import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table";

import { revenueService } from "../service/revenueService";

import { formatCurrencyNumber } from "src/utils/formatCurrencyNumber";

const SummaryTable = () => {

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  // ✅ fetch
  const fetchSummary = async (customParams?: any) => {
    try {
      setLoading(true);

      const res = await revenueService.getSummary(customParams);

      setData(res || []);

    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);


  return (
    <div className="rounded-xl border border-border overflow-hidden">

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>Month</TableHead>

            <TableHead className="text-right">
              Booked Leads
            </TableHead>

            <TableHead className="text-right">
              Accepted Leads
            </TableHead>

            <TableHead className="text-right">
              Deficit Leads
            </TableHead>

            <TableHead className="text-right">
              Booked Revenue
            </TableHead>

            <TableHead className="text-right">
              Accepted Revenue
            </TableHead>

            <TableHead className="text-right">
              Pending Revenue
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {loading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-10 text-muted-foreground"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-10 text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
           data.map((r, index) => (

  <TableRow
    key={index}
    className="even:bg-lightprimary/40"
  >

    {/* MONTH */}
    <TableCell className="font-medium whitespace-nowrap min-w-40">
      {r.month}
    </TableCell>

    {/* BOOKED LEADS */}
    <TableCell className="text-right">

      <div className="font-semibold text-warningstrong tabular-nums">
        {formatCurrencyNumber(r.booked_leads)}
      </div>

    </TableCell>

    {/* ACCEPTED LEADS */}
    <TableCell className="text-right">

      <div className="flex items-center justify-end gap-2">

        <span className="font-semibold text-successemphasis tabular-nums">
          {formatCurrencyNumber(r.accepted_leads?.value)}
        </span>

        <span className="text-xs text-muted-foreground">
          ({r.accepted_leads?.percentage})
        </span>

      </div>

    </TableCell>

    {/* DEFICIT LEADS */}
    <TableCell className="text-right">

      <div className="flex items-center justify-end gap-2">

        <span className="font-semibold text-erroremphasis tabular-nums">
          {formatCurrencyNumber(r.deficit_leads?.value)}
        </span>

        <span className="text-xs text-muted-foreground">
          ({r.deficit_leads?.percentage})
        </span>

      </div>

    </TableCell>

    {/* BOOKED REVENUE */}
    <TableCell className="text-right">

      <div className="font-semibold text-warningstrong tabular-nums">
        $ {formatCurrencyNumber(r.booked_revenue)}
      </div>

    </TableCell>

    {/* ACCEPTED REVENUE */}
    <TableCell className="text-right">

      <div className="font-semibold text-successemphasis tabular-nums">
        $ {formatCurrencyNumber(r.accepted_revenue)}
      </div>

    </TableCell>

    {/* PENDING REVENUE */}
    <TableCell className="text-right">

      <div className="font-semibold text-erroremphasis tabular-nums">
        $ {formatCurrencyNumber(r.revenue_pending)}
      </div>

    </TableCell>

  </TableRow>
))
          )}

        </TableBody>

      </Table>

    </div>
  );
};

export default SummaryTable;