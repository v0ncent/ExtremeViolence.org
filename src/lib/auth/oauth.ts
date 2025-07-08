import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";

export interface OAuthUser {
    id: string;
    email: string;
    name: string;
    image?: string;
    provider: string;
}

// Google OAuth
export const googleOAuth = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "openid email profile",
    redirectUri: "http://localhost:5173/auth/callback/google"
};

// GitHub OAuth
export const githubOAuth = {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scope: "read:user user:email",
    redirectUri: "http://localhost:5173/auth/callback/github"
};

export function getGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: googleOAuth.clientId,
        redirect_uri: googleOAuth.redirectUri,
        response_type: "code",
        scope: googleOAuth.scope,
        state: state
    });
    return `${googleOAuth.authUrl}?${params.toString()}`;
}

export function getGitHubAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: githubOAuth.clientId,
        redirect_uri: githubOAuth.redirectUri,
        response_type: "code",
        scope: githubOAuth.scope,
        state: state
    });
    return `${githubOAuth.authUrl}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<OAuthUser> {
    const tokenResponse = await fetch(googleOAuth.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: googleOAuth.clientId,
            client_secret: googleOAuth.clientSecret,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: googleOAuth.redirectUri
        })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
        throw new Error("Failed to get access token");
    }

    const userResponse = await fetch(googleOAuth.userInfoUrl, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`
        }
    });

    const userData = await userResponse.json();

    return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.picture,
        provider: "google"
    };
}

export async function exchangeGitHubCode(code: string): Promise<OAuthUser> {
    const tokenResponse = await fetch(githubOAuth.tokenUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            client_id: githubOAuth.clientId,
            client_secret: githubOAuth.clientSecret,
            code: code
        })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
        throw new Error("Failed to get access token");
    }

    const userResponse = await fetch(githubOAuth.userInfoUrl, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/vnd.github.v3+json"
        }
    });

    const userData = await userResponse.json();

    // Get email from GitHub
    const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/vnd.github.v3+json"
        }
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((email: any) => email.primary)?.email || userData.email;

    return {
        id: userData.id.toString(),
        email: primaryEmail,
        name: userData.name || userData.login,
        image: userData.avatar_url,
        provider: "github"
    };
} 