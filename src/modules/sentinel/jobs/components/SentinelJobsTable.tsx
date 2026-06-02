import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/ui/table";
import { Input } from "src/components/ui/input";
import { Download, Search, FileWarning } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "src/components/shared/status-badges/StatusBadge";
import { SentinelJobService } from "../services/SentinelJobService";

interface Props {
  jobs: any[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
}

const SentinelJobsTable = ({ jobs, loading, search, setSearch }: Props) => {

  const downloadUploadedFile = async (id: number, fileName: string) => {
    try {
      const blob = await SentinelJobService.downloadUploadedFile(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "uploaded-file.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download uploaded file");
    }
  };

  const downloadFailedFile = async (id: number, fileName?: string) => {
    try {

      const blob = await SentinelJobService.downloadFailedFile(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "failed-file.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download failed file");
    }
  };

  return (

    <div className="space-y-4">

      {/* FILTER */}
       <div className="p-4 flex items-center justify-between gap-4">
        <div className="relative">
          <Search size={16} className=" absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground " />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaign / segment / batch... "
            className=" w-[320px] pl-9 "
          />
        </div>
      </div>

      {/* TABLE */}
      <div className=" rounded-xl border border-border overflow-hidden ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Batch Codes</TableHead>
              <TableHead>Uploaded File</TableHead>
              <TableHead>Failed File</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className=" text-center py-10 text-muted-foreground " >
                  Loading...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className=" text-center py-10 text-muted-foreground " >
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id} className=" hover:bg-lightprimary transition-colors even:bg-lightprimary/40 " >

                  {/* Job ID */}
                  <TableCell className="border-r border-border text-sm font-semibold text-primary whitespace-nowrap ">
                    {job.id}
                  </TableCell>

                  {/* Department */}
                  <TableCell className="border-r border-border whitespace-nowrap ">
                    {job.department}
                  </TableCell>

                  {/* Campaign */}
                  <TableCell className="border-r border-border text-xs whitespace-nowrap max-w-[180px] truncate ">
                    {job.campaign_codes || "-"}
                  </TableCell>

                  {/* Segment */}
                  <TableCell className="border-r border-border text-xs whitespace-nowrap ">
                    {job.segment_codes || "-"}
                  </TableCell>

                  {/* Batch Codes */}
                  <TableCell className="border-r border-border min-w-[220px] max-w-[320px] ">

                    {job.batch_codes ? (

                      <div className="flex flex-wrap gap-1 ">
                        {String(job.batch_codes).split(",").map((batch: string) => (
                          <span
                            key={batch}
                            className="text-xs font-medium text-foreground bg-muted rounded px-1.5 py-0.5 whitespace-nowrap " >
                            {batch.trim()}
                          </span>
                        ))}

                      </div>
                    ) : "-"}
                  </TableCell>

                  {/* Uploaded File */}
                  <TableCell className="border-r border-border text-xs ">
                    {job.file_name ? (
                      <button onClick={() => downloadUploadedFile(job.id, job.file_name)} className="flex items-center gap-1.5 text-info hover:underline whitespace-nowrap" >
                        <Download size={14} className="shrink-0" />
                        <span className="max-w-[180px] truncate ">
                          {job.file_name}
                        </span>
                      </button>
                    ) : "-"}

                  </TableCell>

                  {/* Failed File */}
                  <TableCell className="border-r border-border text-xs ">
                    {job.invalid_file_name ? (
                      <button
                        onClick={() => downloadFailedFile(job.id, job.invalid_file_name)}
                        className="flex items-center gap-1.5 text-error hover:underline whitespace-nowrap " >

                        <FileWarning size={14} className="shrink-0" />
                        <span className="max-w-[180px] truncate ">
                          {job.invalid_file_name}
                        </span>

                      </button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="border-r border-border">
                    <StatusBadge value={job.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SentinelJobsTable;