import { useEffect, useState } from "react";

import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";
import CardBox from "src/components/shared/CardBox";
import CampSegmentTable from "./components/table";

import { Button } from "src/components/ui/button";

import { campaignService } from "../manageCampaigns/services/campaignService";
import { campaignSegmentService } from "./services/campaignSegmentService";
import { formatDateShort } from "src/utils/formatDateShort";
import Can from "src/permissions/CanPermission";
import AutoComplete from "src/components/ui/AutoComplete";
import { useSearchParams } from "react-router";

const CampaignSegmentList = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [allSegments, setAllSegments] = useState<any[]>([]);
    const [filteredSegments, setFilteredSegments] = useState<any[]>([]);
    const [originalSegments, setOriginalSegments] = useState<any[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | undefined>();
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    const [searchParams] = useSearchParams();
    const selectedCampaignFromURL = searchParams.get('campaignId');
    const [isEditing, setIsEditing] = useState(false);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { title: 'Campaign Segment' },
    ];

    // 🔥 Load data ONCE
    const loadAll = async () => {
        try {
            const [campaignData, segmentData] = await Promise.all([
                campaignService.getAllCampaigns(),
                campaignSegmentService.getAllCampaignSegment(),
            ]);
            setCampaigns(campaignData || []);
            setAllSegments(segmentData || []);
            if (selectedCampaignFromURL) {
                const campaignId = Number(selectedCampaignFromURL);
                setSelectedCampaignId(campaignId);
                const campaign = campaignData.find((c: any) => c.id === campaignId);
                setSelectedCampaign(campaign || null);
                const filtered = segmentData.filter((s: any) => s.campaign_id === campaignId);
                setFilteredSegments(filtered);
                setOriginalSegments(filtered);
                return;
            }
            // ✅ DEFAULT
            setSelectedCampaignId(undefined);
            setSelectedCampaign(null);
            setFilteredSegments(segmentData || []);
            setOriginalSegments(segmentData || []);
        } catch {
            setCampaigns([]);
            setAllSegments([]);
            setFilteredSegments([]);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    // 🔥 HANDLE SELECT CHANGE
    const handleCampaignChange = (value: string) => {

        // 🔥 ALL CASE
        if (value === 'all') {
            setSelectedCampaignId(undefined);
            setSelectedCampaign(null);

            setFilteredSegments(allSegments);
            setOriginalSegments(allSegments);

            setIsEditing(false);
            return;
        }

        // 🔥 NORMAL CASE
        const id = Number(value);

        setSelectedCampaignId(id);

        const campaign = campaigns.find((c) => c.id === id);
        setSelectedCampaign(campaign);

        const filtered = allSegments.filter((s) => s.campaign_id === id);

        setFilteredSegments(filtered);
        setOriginalSegments(filtered);

        setIsEditing(false);
    };

    return (
        <>
            <SlimBreadcrumb title="Campaigns" items={BCrumb} />
            <CardBox>

                <div className="flex justify-between items-center">
                    {/* DROPDOWN */}
                    <div className="w-full max-w-lg">
                        <AutoComplete
                            value={selectedCampaignId ? String(selectedCampaignId) : "all"}
                            onChange={handleCampaignChange}
                            placeholder="Search campaign..."
                            options={[
                                { label: "All Campaigns", value: "all", },
                                ...campaigns.map((c) => ({
                                    label: `${c.code} - ${c.campaign_name}`,
                                    value: String(c.id),
                                })),
                            ]}
                        />
                    </div>

                    {/* EDIT BUTTON */}
                    <Can module="campaign_segment" action="edit">
                        <Button variant="lightprimary" disabled={!selectedCampaignId} onClick={() => setIsEditing(true)}>
                            Edit Segments
                        </Button>
                    </Can>

                </div>

                {/* CAMPAIGN REFERENCE */}
                {selectedCampaign && (
                    <div className="mt-4 p-3 border rounded-md bg-muted/30 text-sm space-y-2">
                        <div className="font-semibold">
                            {selectedCampaign.code} - {selectedCampaign.campaign_name}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><strong>Start:</strong>  {formatDateShort(selectedCampaign.start_date)}</div>
                            <div><strong>End:</strong> {formatDateShort(selectedCampaign.end_date)}</div>
                            <div><strong>Allocation:</strong> {selectedCampaign.total_allocation}</div>
                            <div><strong>Delivered:</strong> {selectedCampaign.total_delivered}</div>
                            <div><strong>Accepted:</strong> {selectedCampaign.total_accepted}</div>
                            <div><strong>Rejected:</strong> {selectedCampaign.total_rejected}</div>
                        </div>
                    </div>
                )}

                {/* TABLE */}
                {/* TABLE */}
                <CampSegmentTable
                    originalSegments={originalSegments}
                    campaignId={selectedCampaignId}
                    campaign={selectedCampaign}
                    segments={selectedCampaignId ? filteredSegments : allSegments}
                    setSegments={selectedCampaignId ? setFilteredSegments : setAllSegments}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    setSelectedCampaign={setSelectedCampaign}
                />

            </CardBox>
        </>
    );
};

export default CampaignSegmentList;