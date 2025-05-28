export type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };

export type SparkleType = {
  id: string,
  createdAt: number,
  color: string,
  size: number,
  style: any
}

export type TagType = {
  label: string,
  color?: 'primary' | 'secondary'
}

export type SocialLink = {

}

export type Feature = {
  name: string,
  description: string,
  image: string,
  tags: TagType[]
}

export type BlogPost = {
  [x: string]: any;
  keywords: string[],
  hidden: boolean,
  slug: string,
  title: string,
  date: string,
  updated: string,
  excerpt: string,
  prieviewHtml: string,
  html: string | undefined,
  relatedPosts: BlogPost[],
  coverImage: string
  width: number; 
  height: number; 
  series: boolean;
}