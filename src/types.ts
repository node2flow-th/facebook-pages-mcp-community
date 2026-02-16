/**
 * Facebook Pages API Types
 */

export interface FacebookConfig {
  pageAccessToken: string;
  pageId?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  category?: string;
  tasks?: string[];
}

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time?: string;
  updated_time?: string;
  full_picture?: string;
  permalink_url?: string;
  shares?: { count: number };
  likes?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
}

export interface FacebookComment {
  id: string;
  message: string;
  from?: { name: string; id: string };
  created_time: string;
  like_count?: number;
  is_hidden?: boolean;
}

export interface FacebookPhoto {
  id: string;
  name?: string;
  link?: string;
  created_time?: string;
  images?: Array<{ source: string; width: number; height: number }>;
}

export interface FacebookVideo {
  id: string;
  title?: string;
  description?: string;
  created_time?: string;
  length?: number;
  source?: string;
}

export interface FacebookInsight {
  name: string;
  period: string;
  values: Array<{ value: number | Record<string, number>; end_time: string }>;
  title: string;
  description: string;
}

export interface FacebookConversation {
  id: string;
  updated_time: string;
  snippet?: string;
  message_count?: number;
  participants?: { data: Array<{ name: string; id: string }> };
}

export interface FacebookMessage {
  id: string;
  message?: string;
  from?: { name: string; id: string };
  created_time: string;
}
