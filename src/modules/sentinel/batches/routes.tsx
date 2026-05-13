import { RouteObject } from 'react-router-dom';
import SentinelBatches from './list';
import SentinelDetailBatch from './details';

const SentinelBatchesRoute: RouteObject[] = [
    {
        path: '/sentinel-segments',
        element: <SentinelBatches />,
    },
    {
        path: '/sentinel-segments/segment-details/:segmentCode',
        element: <SentinelDetailBatch />,
    }
];


export default SentinelBatchesRoute