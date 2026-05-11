import { RouteObject } from 'react-router-dom';
import SentinelBatches from './list';
import SentinelDetailBatch from './details';

const SentinelBatchesRoute: RouteObject[] = [
    {
        path: '/sentinel-batches',
        element: <SentinelBatches />,
    },
    {
        path: '/sentinel-batches/:id',
        element: <SentinelDetailBatch />,
    }
];


export default SentinelBatchesRoute