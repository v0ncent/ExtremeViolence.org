import { auth } from '../../../../hooks.server';

// For older versions of Auth.js, we need to handle the requests manually
export const GET = auth;
export const POST = auth;