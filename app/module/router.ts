import { Method } from '@middy/http-router';

import listHandler from "./handlers/list";
import detailHandler from "./handlers/detail";
import createHandler from "./handlers/create";

const router = [
    {
        method: 'GET' as Method,
        path: '/modules',
        handler: listHandler,
    },
    {
        method: 'GET' as Method,
        path: '/modules/{id}',
        handler: detailHandler,
    },
    {
        method: 'POST' as Method,
        path: '/modules',
        handler: createHandler,
    }
];

export default router;
