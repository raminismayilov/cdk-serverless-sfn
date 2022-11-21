import middy from '@middy/core';
import httpRouterHandler from '@middy/http-router';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer"
import router from "./router";

export const handler = middy()
    .use(httpHeaderNormalizer())
    .use(httpJsonBodyParser())
    .handler(httpRouterHandler(router))
    .use(httpErrorHandler());
