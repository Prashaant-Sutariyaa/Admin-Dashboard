import apiClient from "src/services/apiClient";

export const SentinelJobService = {

    async getJobs(
        page = 1,
        limit = 10,
        search?: string
    ): Promise<any> {

        const params: any = {
            page,
            limit,
        };

        if (search?.trim()) {

            params.search =
                search.trim();
        }

        const res =
            await apiClient.get(
                "/sentinel-jobs/",
                { params }
            );

        return res.data;
    },

    async downloadUploadedFile(
        id: number
    ) {

        const res =
            await apiClient.get(
                `/sentinel-jobs/${id}/download-uploaded-file`,
                {
                    responseType: "blob",
                }
            );

        return res.data;
    },

    async downloadFailedFile(
        id: number
    ) {

        const res =
            await apiClient.get(
                `/sentinel-jobs/${id}/download-failed-file`,
                {
                    responseType: "blob",
                }
            );

        return res.data;
    },
};