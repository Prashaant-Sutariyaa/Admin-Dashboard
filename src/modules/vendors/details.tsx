import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import { Download } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from 'src/components/ui/tooltip';
import { Button } from 'src/components/ui/button';
import { vendorService, Vendor } from './services/vendorService';
import companyImg from 'src/assets/images/dashboard/vendor.png';
import Can from 'src/permissions/CanPermission';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';

const VendorDetails = () => {
    const { id } = useParams();
    const [vendor, setVendor] = useState<Vendor | null>(null);

    const loadVendor = async () => {
        if (!id) return;
        const data = await vendorService.getVendorById(Number(id));
        setVendor(data);
    };

    useEffect(() => {
        loadVendor();
    }, [id]);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/vendors', title: 'Vendors' },
        { title: 'Details' },
    ];

    if (!vendor) return null;

    return (
        <>
            <SlimBreadcrumb title="Vendor Details" items={BCrumb} />

            <div className="flex flex-col gap-6">

                {/* 🔹 Header Card */}
                <CardBox className="p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">

                        {/* Image */}
                        <div>
                            <img
                                src={companyImg}
                                alt="company"
                                width={80}
                                height={80}
                                className="rounded-lg"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex justify-between items-center w-full flex-wrap gap-4">

                            {/* Left Info */}
                            <div className="flex flex-col gap-1.5 text-center sm:text-left">
                                <h5 className="card-title">
                                    {vendor.name}
                                </h5>

                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        {vendor.country}
                                    </p>

                                    <div className="hidden h-4 w-px bg-border xl:block"></div>

                                    <p className="text-sm text-muted-foreground">
                                        <StatusBadge value={vendor.isActive ? 'Active' : 'Inactive'} />
                                    </p>

                                    <div className="hidden h-4 w-px bg-border xl:block"></div>

                                    <p className="text-sm text-muted-foreground">
                                        {vendor.code}
                                    </p>
                                </div>
                            </div>
                            <Can module="vendor" action="download">
                                {/* ✅ Right Side Download */}
                                {vendor.contractFileName && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="lightprimary"
                                                    className="flex items-center gap-2"
                                                    onClick={() => vendorService.downloadContract(vendor.id)}
                                                >
                                                    <Download className="size-4" />
                                                    Download Contract
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {vendor.contractFileName}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </Can>
                        </div>

                    </div>
                </CardBox>

                {/* 🔹 Two Column Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    {/* Vendors Info */}
                    <CardBox className="p-6">
                        <h5 className="card-title mb-6">Vendors Information</h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>
                                <p className="text-xs text-muted-foreground">Vendor Name</p>
                                <p>{vendor.name}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Country</p>
                                <p>{vendor.country}</p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground">Address</p>
                                <p>{vendor.address}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p>{vendor.isActive ? 'Active' : 'Inactive'}</p>
                            </div>

                        </div>
                    </CardBox>

                    {/* Contact Info */}
                    <CardBox className="p-6">
                        <h5 className="card-title mb-6">Contact Information</h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <div>
                                <p className="text-xs text-muted-foreground">First Name</p>
                                <p>{vendor.firstName}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Last Name</p>
                                <p>{vendor.lastName}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p>{vendor.contactEmail}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Mobile</p>
                                <p>{vendor.contactMobileNumber}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Office Number</p>
                                <p>{vendor.contactOfficeNumber}</p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Designation</p>
                                <p>{vendor.contactDesignation}</p>
                            </div>

                        </div>
                    </CardBox>

                </div>

                {/* 🔹 Billing Full Width */}
                <CardBox className="p-6">
                    <h5 className="card-title mb-6">Billing Information</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <p className="text-xs text-muted-foreground">Billing Name</p>
                            <p>{vendor.billingName}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Billing Email</p>
                            <p>{vendor.billingEmail}</p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">Billing Address</p>
                            <p>{vendor.billingAddress}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Billing Terms</p>
                            <p>{vendor.billingTerms}</p>
                        </div>

                    </div>
                </CardBox>

            </div>
        </>
    );
};

export default VendorDetails;