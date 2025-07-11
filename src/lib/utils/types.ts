export type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };

export type SparkleType = {
	id: string;
	createdAt: number;
	color: string;
	size: number;
	style: any;
};

export type TagType = {
	label: string;
	color?: 'primary' | 'secondary';
};

export type SocialLink = {};

export type Feature = {
	name: string;
	description: string;
	image: string;
	tags: TagType[];
};

// --- Backend-aligned Models ---

// Base Model (all have UUID id)
export interface BaseModel {
	id: string; // UUID
}

// UserDataModel
export interface UserDataModel extends BaseModel {
	email: string;
	authProvider: string;
	isAdmin: boolean;
	imagePath: string;
	userName: string;
	banned: boolean;
	ipAddress: string;
}

// UserContentModel
export interface UserContentModel extends BaseModel {
	userId: string; // UUID of the user
	comments: UserContentComment[];
}

export interface UserContentComment {
	commentId: string; // UUID
	postId: string; // UUID of the post
	postTitle: string;
	section: string;
	text: string;
	date: string;
}

// ContentModel (abstract, but used for News, etc.)
export interface ContentModel extends BaseModel {
	title: string;
	slug: string;
	date: string;
	coverImage: string;
	postId: string; // UUID
	comments: PostComment[];
	excerpt: string;
	tags: string;
}

export interface PostComment {
	postId: string; // UUID of the post
	userId: string; // UUID of the user
	text: string;
	date: string;
}

// NewsContentModel
export interface NewsContentModel extends ContentModel {
	html: string;
}

// BannedUsersModel
export interface BannedUsersModel extends BaseModel {
	email: string;
	userId: string; // UUID of the user
	ipAddress: string;
}

// --- Deprecated/Legacy ---
// Use NewsContentModel or ContentModel instead
// export type BlogPost = { ... } // Deprecated
